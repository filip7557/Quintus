using Autofac;
using Autofac.Extensions.DependencyInjection;
using CloudinaryDotNet;
using dotenv.net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Quintus.Repository;
using Quintus.Repository.Common;
using Quintus.Repository.Context;
using Quintus.Service;
using Quintus.Service.Common;
using Quintus.Worker;
using Scalar.AspNetCore;
using System.Text;
using System.Threading.RateLimiting;

DotEnv.Load(options: new DotEnvOptions(probeForEnv: true));

var builder = WebApplication.CreateBuilder(args);

// Force HTTP-only by default (recommended when running behind nginx/ingress and terminating TLS there).
// If you want HTTPS in-container, set ASPNETCORE_URLS yourself (and provide a cert).
if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ASPNETCORE_URLS")))
{
    builder.WebHost.UseUrls("http://+:8080");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowQuintusDevOrigins", policy =>
    {
        policy.WithOrigins(
                    "http://localhost:3000",
                    "http://127.0.0.1:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithExposedHeaders("Authorization", "Content-Disposition");
    });

    options.AddPolicy("AllowQuintusProdOrigins", policy =>
    {
        policy.WithOrigins(
                    "https://www.instalacije-quintus.hr")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithExposedHeaders("Authorization", "Content-Disposition");
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(Environment.GetEnvironmentVariable("ConnectionStrings_QuintusDb")
        ?? throw new InvalidOperationException("Database connection string is not set.")));

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("LoginRegisterPolicy", context =>
    {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return RateLimitPartition.GetTokenBucketLimiter(ip, _ => new TokenBucketRateLimiterOptions
        {
            TokenLimit = 5,
            TokensPerPeriod = 5,
            ReplenishmentPeriod = TimeSpan.FromMinutes(1),
            AutoReplenishment = true,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 2
        });
    });
});

builder.Services.AddHttpClient();

// Add services to the container.
builder.Host
    .UseServiceProviderFactory(new AutofacServiceProviderFactory())
    .ConfigureContainer<ContainerBuilder>(containerBuilder =>
    {
        // Register your own things directly with Autofac here.
        containerBuilder.RegisterType<UserRepository>().As<IUserRepository>();
        containerBuilder.RegisterType<UserService>().As<IUserService>();
        containerBuilder.RegisterType<AppointmentRepository>().As<IAppointmentRepository>();
        containerBuilder.RegisterType<AppointmentService>().As<IAppointmentService>();

        containerBuilder.RegisterType<EmailVerificationTokenRepository>().As<IEmailVerificationTokenRepository>();
        containerBuilder.RegisterType<EmailService>().As<IEmailService>();
        containerBuilder.RegisterType<EmailVerificationService>().As<IEmailVerificationService>();

        containerBuilder.RegisterType<PasswordResetTokenRepository>().As<IPasswordResetTokenRepository>();
        containerBuilder.RegisterType<PasswordResetService>().As<IPasswordResetService>();

        containerBuilder.RegisterType<TokenService>().As<ITokenService>();
        containerBuilder.RegisterType<RefreshTokenRepository>().As<IRefreshTokenRepository>();
        containerBuilder.RegisterType<AuthService>().As<IAuthService>();

        containerBuilder.RegisterType<RoleRepository>().As<IRoleRepository>();
        containerBuilder.RegisterType<RoleService>().As<IRoleService>();

        containerBuilder.RegisterType<ImageRepository>().As<IImageRepository>();
        containerBuilder.RegisterType<ImageService>().As<IImageService>();

        containerBuilder.RegisterType<Cloudinary>()
            .As<ICloudinary>()
            .WithParameter("cloudinaryUrl", Environment.GetEnvironmentVariable("CLOUDINARY_URL")
            ?? throw new InvalidOperationException("Cloudinary url string is not set."));

        containerBuilder.RegisterType<RequestRepository>().As<IRequestRepository>();
        containerBuilder.RegisterType<RequestService>().As<IRequestService>();

        containerBuilder.RegisterType<SiteSettingsRepository>().As<ISiteSettingsRepository>();
        containerBuilder.RegisterType<SiteSettingsService>().As<ISiteSettingsService>();

        containerBuilder.RegisterType<ContactService>().As<IContactService>();

        containerBuilder.RegisterType<ServiceRepository>().As<IServiceRepository>();
        containerBuilder.RegisterType<ServiceService>().As<IServiceService>();

        containerBuilder.RegisterType<OfferRepository>().As<IOfferRepository>();
        containerBuilder.RegisterType<OfferService>().As<IOfferService>();

        containerBuilder.RegisterType<UnitOfMeasurementRepository>().As<IUnitOfMeasurementRepository>();
        containerBuilder.RegisterType<UnitOfMeasurementService>().As<IUnitOfMeasurementService>();

        containerBuilder.RegisterType<PdfOfferService>();
    });

builder.Services.AddSingleton<IEmailQueue, EmailQueue>();
builder.Services.AddHostedService<EmailWorkerService>();

builder.Services.AddHttpContextAccessor();

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!))
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                if (string.IsNullOrEmpty(context.Error))
                    context.Error = "invalid_token";
                if (string.IsNullOrEmpty(context.ErrorDescription))
                    context.ErrorDescription = "This request requires a valid JWT access token.";

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapScalarApiReference();
}

//app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowQuintusDevOrigins");
}
else
{
    app.UseCors("AllowQuintusProdOrigins");
}

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();