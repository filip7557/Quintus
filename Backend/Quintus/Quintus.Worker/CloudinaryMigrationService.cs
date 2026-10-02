using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Worker
{
    public class ImageMigrationOptions
    {
        public bool Enabled { get; set; }
    }

    public class CloudinaryMigrationService : BackgroundService
    {
        private const string CloudinaryPrefix = "https://res.cloudinary.com/";
        private const string CloudinaryHost = "res.cloudinary.com";
        private const long MaxDownloadSize = 50 * 1024 * 1024;

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ImageMigrationOptions _options;
        private readonly ILogger<CloudinaryMigrationService> _logger;

        public CloudinaryMigrationService(
            IServiceScopeFactory scopeFactory,
            IHttpClientFactory httpClientFactory,
            IOptions<ImageMigrationOptions> options,
            ILogger<CloudinaryMigrationService> logger)
        {
            _scopeFactory = scopeFactory;
            _httpClientFactory = httpClientFactory;
            _options = options.Value;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_options.Enabled)
                return;

            await using var scope = _scopeFactory.CreateAsyncScope();
            var references = scope.ServiceProvider.GetRequiredService<IImageReferenceRepository>();
            var s3 = scope.ServiceProvider.GetRequiredService<IS3Service>();
            var optimizer = scope.ServiceProvider.GetRequiredService<IImageOptimizer>();
            var http = _httpClientFactory.CreateClient();

            var urls = await references.GetReferencedUrlsWithPrefixAsync(CloudinaryPrefix);
            _logger.LogInformation("Cloudinary migration found {Count} image(s) to migrate.", urls.Count);

            var migrated = 0;
            var failed = 0;
            foreach (var url in urls)
            {
                stoppingToken.ThrowIfCancellationRequested();

                if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
                    uri.Scheme != Uri.UriSchemeHttps ||
                    !string.Equals(uri.Host, CloudinaryHost, StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning("Skipping non-Cloudinary URL {Url}.", url);
                    continue;
                }

                try
                {
                    using var response = await http.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, stoppingToken);
                    response.EnsureSuccessStatusCode();

                    if (response.Content.Headers.ContentLength > MaxDownloadSize)
                        throw new InvalidOperationException("Image is too large to migrate.");

                    await using var body = await response.Content.ReadAsStreamAsync(stoppingToken);
                    var optimized = await optimizer.OptimizeAsync(body, stoppingToken);

                    var key = $"images/{Guid.NewGuid():N}";
                    using var output = new MemoryStream(optimized);
                    await s3.PutObjectAsync(key, output, optimizer.ContentType, "public, max-age=31536000", stoppingToken);

                    await references.ReplaceUrlAsync(url, s3.GetPublicUrl(key));
                    migrated++;
                }
                catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
                {
                    failed++;
                    _logger.LogWarning(ex, "Failed to migrate Cloudinary image {Url}.", url);
                }
            }

            _logger.LogInformation("Cloudinary migration finished: {Migrated} migrated, {Failed} failed.", migrated, failed);
        }
    }
}
