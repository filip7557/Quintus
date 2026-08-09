using Microsoft.Extensions.Configuration;
using Quintus.Common.Exceptions;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;
using System.Security.Cryptography;
using System.Text;

namespace Quintus.Service
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordResetTokenRepository _tokenRepository;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;

        public PasswordResetService(IUserRepository userRepository, IPasswordResetTokenRepository tokenRepository, IEmailService emailService, IConfiguration config)
        {
            _userRepository = userRepository;
            _tokenRepository = tokenRepository;
            _emailService = emailService;
            _config = config;
        }

        public async Task SendResetAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return;

            var user = await _userRepository.GetUserByEmailAsync(email);
            if (user == null)
                return;

            var rawToken = CreateRawToken();
            var tokenHash = HashToken(rawToken);

            var token = new PasswordResetToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = tokenHash,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                UsedAt = null
            };

            await _tokenRepository.SaveAsync(token);

            var frontendBaseUrl = _config["App:FrontendBaseUrl"]?.TrimEnd('/');
            if (string.IsNullOrWhiteSpace(frontendBaseUrl))
                throw new InvalidOperationException("Missing config App:FrontendBaseUrl (e.g. https://quintus.eu)");

            var resetUrl = $"{frontendBaseUrl}/reset-password?token={Uri.EscapeDataString(rawToken)}";

            var subject = "Reset lozinke";
            var html = EmailTemplates.Build(
                title: "Reset lozinke",
                intro: "Zaprimili smo zahtjev za reset lozinke.\nKliknite na gumb ispod kako biste postavili novu lozinku.",
                ctaText: "Reset lozinke",
                ctaUrl: resetUrl,
                outro: "Ovaj link vrijedi 1 sat. Ako niste tražili reset, ignorirajte ovu poruku.",
                logoUrl: "https://www.instalacije-quintus.hr/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75"
            );

            await _emailService.SendEmailAsync(user.Email, subject, html);
        }

        public async Task<bool> ResetAsync(string token, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(token)) return false;

            if (!IsPasswordValid(newPassword, out var error))
                throw new InvalidPasswordException(error);

            var tokenHash = HashToken(token);
            var resetToken = await _tokenRepository.GetActiveByTokenHashAsync(tokenHash);
            if (resetToken == null || resetToken.User == null)
                return false;

            resetToken.User.PasswordHash = HashPassword(newPassword);
            resetToken.User.UpdatedAt = DateTime.UtcNow;

            await _tokenRepository.MarkUsedAsync(resetToken);

            // reuse repository update call: we need a dedicated method; use direct context-free approach via SetPasswordHashAsync
            return await _userRepository.SetPasswordHashAsync(resetToken.UserId, resetToken.User.PasswordHash);
        }

        private static bool IsPasswordValid(string? password, out string errorMessage)
        {
            errorMessage = string.Empty;

            if (string.IsNullOrWhiteSpace(password))
            {
                errorMessage = "Potrebno je unijeti lozinku.";
                return false;
            }

            if (password.Length < 6)
            {
                errorMessage = "Lozinka mora imati barem 6 znakova.";
                return false;
            }

            if (!password.Any(char.IsUpper))
            {
                errorMessage = "Lozinka mora sadržavati barem jedno veliko slovo.";
                return false;
            }

            if (!password.Any(char.IsLower))
            {
                errorMessage = "Lozinka mora sadržavati barem jedno malo slovo.";
                return false;
            }

            if (!password.Any(char.IsDigit))
            {
                errorMessage = "Lozinka mora sadržavati barem jedan broj.";
                return false;
            }

            if (!password.Any(ch => "!@#$%^&*()-_=+[]{}|;:'\",.<>?/`~".Contains(ch)))
            {
                errorMessage = "Lozinka mora sadršavati barem jedan poseban znak.";
                return false;
            }

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

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}