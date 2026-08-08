using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class EmailVerificationService : IEmailVerificationService
    {
        private readonly AppDbContext _context;
        private readonly IEmailVerificationTokenRepository _tokenRepo;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;

        public EmailVerificationService(AppDbContext context, IEmailVerificationTokenRepository tokenRepo, IEmailService emailService, IConfiguration config)
        {
            _context = context;
            _tokenRepo = tokenRepo;
            _emailService = emailService;
            _config = config;
        }

        public async Task SendVerificationAsync(Guid userId, string toEmail)
        {
            var baseUrl = _config["App:PublicBaseUrl"]?.TrimEnd('/');
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

            var verifyUrl = $"{baseUrl}/api/auth/verify-email?token={Uri.EscapeDataString(rawToken)}";

            var subject = "Potvrdite svoj email";
            var html = $@"<p>Hvala na registraciji.</p>
<p>Kliknite na link za potvrdu emaila:</p>
<p><a href=\"{verifyUrl}\">Potvrdi email</a></p>
<p>Ako niste vi napravili ovaj ra?un, ignorirajte ovu poruku.</p>";

            await _emailService.SendEmailAsync(toEmail, subject, html);
        }

        public async Task<bool> VerifyAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return false;

            var tokenHash = HashToken(token);
            var active = await _tokenRepo.GetActiveByTokenHashAsync(tokenHash);
            if (active == null || active.User == null) return false;

            if (active.User.EmailVerified) return true;

            active.User.EmailVerified = true;
            active.User.UpdatedAt = DateTime.UtcNow;

            await _tokenRepo.MarkUsedAsync(active);
            _context.Users.Update(active.User);
            await _context.SaveChangesAsync();

            return true;
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
