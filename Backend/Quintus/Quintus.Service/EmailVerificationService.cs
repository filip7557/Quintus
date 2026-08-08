using Microsoft.Extensions.Configuration;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;
using System.Security.Cryptography;
using System.Text;

namespace Quintus.Service
{
    public class EmailVerificationService : IEmailVerificationService
    {
        private readonly IUserRepository _userRepository;
        private readonly IEmailVerificationTokenRepository _tokenRepo;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;

        public EmailVerificationService(IUserRepository userRepository, IEmailVerificationTokenRepository tokenRepo, IEmailService emailService, IConfiguration config)
        {
            _userRepository = userRepository;
            _tokenRepo = tokenRepo;
            _emailService = emailService;
            _config = config;
        }

        public async Task SendVerificationAsync(Guid userId, string toEmail)
        {
            var baseUrl = _config["App:FrontendBaseUrl"]?.TrimEnd('/');
            if (string.IsNullOrWhiteSpace(baseUrl))
                throw new InvalidOperationException("Missing config App:PublicBaseUrl (e.g. https://quintus.eu)");

            var rawToken = CreateRawToken();
            var tokenHash = HashToken(rawToken);

            var token = new EmailVerificationToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TokenHash = tokenHash,
                ExpiresAt = DateTime.UtcNow.AddHours(24),
                UsedAt = null
            };

            await _tokenRepo.SaveAsync(token);

            var verifyUrl = $"{baseUrl}/verify-email?token={Uri.EscapeDataString(rawToken)}";

            var subject = "Potvrdite svoj email";
            var html = EmailTemplates.Build(
                title: "Potvrdite svoj email",
                intro: "Hvala na registraciji.\nKliknite na gumb ispod kako biste potvrdili email adresu.",
                ctaText: "Potvrdi email",
                ctaUrl: verifyUrl,
                outro: "Ako niste vi napravili ovaj račun, ignorirajte ovu poruku.",
                logoUrl: "https://quintus.fcuric.eu/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75"
            );

            await _emailService.SendEmailAsync(toEmail, subject, html);
        }

        public async Task<bool> VerifyAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return false;

            var tokenHash = HashToken(token);
            var active = await _tokenRepo.GetActiveByTokenHashAsync(tokenHash);
            if (active == null || active.User == null) return false;

            if (active.User.EmailVerified) return true;

            await _tokenRepo.MarkUsedAsync(active);
            return await _userRepository.SetEmailVerifiedAsync(active.UserId);
        }

        private static string CreateRawToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            return Convert.ToBase64String(bytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');
        }

        private static string HashToken(string rawToken)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawToken));
            return Convert.ToBase64String(bytes);
        }
    }
}