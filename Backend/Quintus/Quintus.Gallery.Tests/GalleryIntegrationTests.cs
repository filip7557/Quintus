using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using dotenv.net;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using Quintus.Common.Projects;
using Quintus.Model.Entities;
using Quintus.Repository;
using Quintus.Repository.Context;
using Quintus.Service;
using Quintus.Service.Common;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using Xunit;

namespace Quintus.Gallery.Tests;

public class GalleryIntegrationTests
{
    private static IConfiguration Configuration()
    {
        var apiDirectory = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../Quintus.WebAPI"));
        var environment = DotEnv.Read(options: new DotEnvOptions(envFilePaths: new[] { Path.Combine(apiDirectory, ".env") }));
        return new ConfigurationBuilder().SetBasePath(apiDirectory)
            .AddJsonFile("appsettings.json").AddJsonFile("appsettings.Development.json", optional: true)
            .AddUserSecrets(typeof(Quintus.WebAPI.Controllers.ProjectController).Assembly, optional: true)
            .AddInMemoryCollection(environment.Select(pair => new KeyValuePair<string, string?>(pair.Key.Replace("__", ":"), pair.Value)))
            .AddEnvironmentVariables().Build();
    }

    [Fact]
    public async Task ImagesAreOwnedAndCleanupIsTransactional()
    {
        Configuration();
        var connection = new NpgsqlConnectionStringBuilder(Environment.GetEnvironmentVariable("ConnectionStrings_QuintusDb"));
        Assert.Contains(connection.Host, new[] { "localhost", "127.0.0.1", "::1" });
        var schema = $"gallery_test_{Guid.NewGuid():N}";
        var quotedSchema = new NpgsqlCommandBuilder().QuoteIdentifier(schema);
        var createSchema = $"CREATE SCHEMA {quotedSchema}";
        var dropSchema = $"DROP SCHEMA {quotedSchema} CASCADE";
        await using var admin = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(connection.ConnectionString).Options);
        await admin.Database.ExecuteSqlRawAsync(createSchema);
        try
        {
            connection.SearchPath = schema;
            await using var database = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(connection.ConnectionString).Options);
            await database.Database.ExecuteSqlRawAsync(database.Database.GenerateCreateScript());
            var storage = new MemoryStorage();
            var signal = new TestSignal();
            var images = new ImageRepository(database);
            var jobs = new StorageJobRepository(database);
            var cleanup = new StorageCleanupService(images, jobs, storage, signal);
            var uploader = new ImageService(images, jobs, cleanup, signal, storage);
            var repository = new ProjectRepository(database);
            var projects = new ProjectService(repository, uploader, cleanup);
            var first = await projects.CreateAsync(new ProjectRequest { Name = "  First site  ", Address = "Test address", ClientName = "Test client" });
            var second = await projects.CreateAsync(new ProjectRequest { Name = "Second site" });
            Assert.Equal("First site", first.Name);
            Assert.Equal(2, (await projects.GetAsync(new ProjectFilter())).TotalCount);
            Assert.Single((await projects.GetAsync(new ProjectFilter { Search = "TEST CLIENT" })).Items);

            using var buffer = new MemoryStream();
            using (var bitmap = new SixLabors.ImageSharp.Image<Rgba32>(3000, 120))
                await bitmap.SaveAsPngAsync(buffer);
            var file = new FormFile(buffer, 0, buffer.Length, "file", "test.png");
            var photo = await projects.UploadAsync(first.Id, file);
            Assert.NotNull(photo);
            Assert.Equal(1, (await projects.GetByIdAsync(first.Id))!.PhotoCount);
            Assert.Single(await database.StorageJobs.Where(job => job.Type == StorageJobType.OptimizeImage).ToListAsync());
            Assert.False(await projects.DeleteAsync(second.Id, photo.Id));

            using var original = new MemoryStream(storage.Objects.Values.Single());
            var optimized = await new ImageOptimizer().OptimizeAsync(original);
            using var output = SixLabors.ImageSharp.Image.Load(optimized);
            Assert.Equal(2560, output.Width);
            Assert.Equal("Webp", output.Metadata.DecodedImageFormat!.Name);
            Assert.Null(output.Metadata.ExifProfile);

            await Assert.ThrowsAsync<InvalidOperationException>(() => repository.RemoveAsync(first.Id, photo.Id,
                _ => throw new InvalidOperationException("Simulated queue failure")));
            database.ChangeTracker.Clear();
            Assert.Equal(1, await database.GalleryProjectImages.CountAsync());
            Assert.Equal(1, await database.Images.CountAsync());
            Assert.True(await projects.DeleteAsync(first.Id, photo.Id));
            Assert.Empty(await database.GalleryProjectImages.ToListAsync());
            Assert.Empty(await database.Images.ToListAsync());
            Assert.Single(await database.StorageJobs.Where(job => job.Type == StorageJobType.DeleteObject).ToListAsync());

            var otherPhoto = await projects.UploadAsync(second.Id, file);
            Assert.NotNull(otherPhoto);
            Assert.True(await projects.DeleteAsync(second.Id));
            Assert.Null(await projects.GetByIdAsync(second.Id));
            Assert.Empty(await database.Images.ToListAsync());

            var disappearing = await projects.CreateAsync(new ProjectRequest { Name = "Deleted during upload" });
            storage.OnPut = async () => { Assert.True(await projects.DeleteAsync(disappearing.Id)); storage.OnPut = null; };
            Assert.Null(await projects.UploadAsync(disappearing.Id, file));
            Assert.Empty(await database.Images.ToListAsync());
            Assert.Equal(3, await database.StorageJobs.CountAsync(job => job.Type == StorageJobType.DeleteObject));
            Assert.True(signal.Notifications > 0);
            await Assert.ThrowsAsync<ArgumentException>(() => projects.CreateAsync(new ProjectRequest { Name = " " }));
            using var invalid = new MemoryStream(Encoding.UTF8.GetBytes("Not an image"));
            await Assert.ThrowsAsync<ArgumentException>(() => uploader.AddImageAsync(new FormFile(invalid, 0, invalid.Length, "file", "invalid.png")));
        }
        finally { await admin.Database.ExecuteSqlRawAsync(dropSchema); }
    }

    [Fact]
    public async Task LocalApiEnforcesRolesAndSharedMetadataAccess()
    {
        var configuration = Configuration();
        var address = Environment.GetEnvironmentVariable("QUINTUS_GALLERY_TEST_API_URL") ?? "http://localhost:5113";
        Assert.True(new Uri(address).IsLoopback, "API integration tests must target a local server.");
        using var client = new HttpClient { BaseAddress = new Uri(address) };
        var issuer = configuration["Jwt:Issuer"]!;
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        string Token(string role) => new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(issuer, issuer,
            new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, role) },
            expires: DateTime.UtcNow.AddMinutes(5), signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)));
        var unknown = Guid.NewGuid();
        foreach (var role in new string?[] { null, "User" })
        {
            client.DefaultRequestHeaders.Authorization = role == null ? null : new AuthenticationHeaderValue("Bearer", Token(role));
            var expected = role == null ? HttpStatusCode.Unauthorized : HttpStatusCode.Forbidden;
            foreach (var path in new[] { "/api/Project", $"/api/Project/{unknown}", $"/api/Project/{unknown}/images" })
                Assert.Equal(expected, (await client.GetAsync(path)).StatusCode);
            Assert.Equal(expected, (await client.PostAsJsonAsync("/api/Project", new ProjectRequest { Name = "Unauthorized" })).StatusCode);
            Assert.Equal(expected, (await client.PutAsJsonAsync($"/api/Project/{unknown}", new ProjectRequest { Name = "Unauthorized" })).StatusCode);
            Assert.Equal(expected, (await client.DeleteAsync($"/api/Project/{unknown}")).StatusCode);
            Assert.Equal(expected, (await client.DeleteAsync($"/api/Project/{unknown}/images/{unknown}")).StatusCode);
            using var form = new MultipartFormDataContent { { new ByteArrayContent([0]), "file", "invalid.png" } };
            Assert.Equal(expected, (await client.PostAsync($"/api/Project/{unknown}/images", form)).StatusCode);
        }

        Guid? created = null;
        try
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token("Admin"));
            var response = await client.PostAsJsonAsync("/api/Project", new ProjectRequest { Name = "Gallery integration test" });
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            created = (await response.Content.ReadFromJsonAsync<ProjectResponse>())!.Id;
            foreach (var role in new[] { "Admin", "Owner", "Worker" })
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token(role));
                Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/Project")).StatusCode);
                Assert.Equal(HttpStatusCode.OK, (await client.GetAsync($"/api/Project/{created}")).StatusCode);
                Assert.Equal(HttpStatusCode.OK, (await client.GetAsync($"/api/Project/{created}/images")).StatusCode);
                Assert.Equal(HttpStatusCode.OK, (await client.PutAsJsonAsync($"/api/Project/{created}", new ProjectRequest { Name = $"Updated by {role}" })).StatusCode);
                Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/Project", new ProjectRequest { Name = " " })).StatusCode);
                Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync("/api/Project?page=0")).StatusCode);
                Assert.Equal(HttpStatusCode.NotFound, (await client.DeleteAsync($"/api/Project/{created}/images/{unknown}")).StatusCode);
                using var form = new MultipartFormDataContent { { new ByteArrayContent([0]), "file", "invalid.png" } };
                Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsync($"/api/Project/{created}/images", form)).StatusCode);
            }
            Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync($"/api/Project/{created}")).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/Project/{created}")).StatusCode);
            created = null;
        }
        finally
        {
            if (created.HasValue)
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token("Admin"));
                await client.DeleteAsync($"/api/Project/{created}");
            }
        }
    }

    private sealed class TestSignal : IStorageJobSignal
    {
        public int Notifications { get; private set; }
        public void Notify() => Notifications++;
        public Task WaitAsync(TimeSpan timeout, CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class MemoryStorage : IS3Service
    {
        public Dictionary<string, byte[]> Objects { get; } = new();
        public Func<Task>? OnPut { get; set; }
        public Task<string> UploadFileAsync(IFormFile file, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public async Task PutObjectAsync(string key, Stream content, string contentType, string cacheControl, CancellationToken cancellationToken = default)
        {
            using var buffer = new MemoryStream();
            await content.CopyToAsync(buffer, cancellationToken);
            Objects[key] = buffer.ToArray();
            if (OnPut != null) await OnPut();
        }
        public Task<byte[]?> GetObjectBytesAsync(string key, CancellationToken cancellationToken = default) =>
            Task.FromResult(Objects.GetValueOrDefault(key));
        public Task DeleteObjectAsync(string key, CancellationToken cancellationToken = default)
        {
            Objects.Remove(key);
            return Task.CompletedTask;
        }
        public string GetPublicUrl(string key) => $"https://gallery-test.invalid/{key}";
        public bool TryGetObjectKey(string? url, out string key)
        {
            const string prefix = "https://gallery-test.invalid/";
            key = url?.StartsWith(prefix, StringComparison.Ordinal) == true ? url[prefix.Length..] : "";
            return key.Length > 0;
        }
    }
}