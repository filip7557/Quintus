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
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader()
               .WithExposedHeaders("Authorization");
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
    });

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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapScalarApiReference();
}

//app.UseHttpsRedirection();

app.UseCors("AllowAllOrigins");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();