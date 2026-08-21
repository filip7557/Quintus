using Quintus.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class ContactService : IContactService
    {
        private readonly IEmailService _emailService;
        private readonly ISiteSettingsService _siteSettingsService;

        public ContactService(IEmailService emailService, ISiteSettingsService siteSettingsService)
        {
            _emailService = emailService;
            _siteSettingsService = siteSettingsService;
        }

        public async Task SendContactAsync(ContactFormRequest request)
        {
            if (request == null)
                throw new ArgumentException("Neispravan zahtjev.");

            var fullName = (request.FullName ?? string.Empty).Trim();
            var email = (request.Email ?? string.Empty).Trim();
            var message = (request.Message ?? string.Empty).Trim();

            if (string.IsNullOrWhiteSpace(fullName))
                throw new ArgumentException("Ime i prezime su obavezni.");
            if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
                throw new ArgumentException("E-mail adresa nije ispravna.");
            if (string.IsNullOrWhiteSpace(message))
                throw new ArgumentException("Poruka je obavezna.");

            var siteSettings = await _siteSettingsService.GetSiteSettingsAsync();
            var to = siteSettings?.ContactEmail?.Trim();
            if (string.IsNullOrWhiteSpace(to))
                throw new InvalidOperationException("Nedostaje konfiguracija kontakt e-mail adrese u postavkama stranice.");

            var mailto = $"mailto:{email}";
            var subject = $"Kontakt (web): {fullName}";

            var html = EmailTemplates.Build(
                title: "Quintus - Nova poruka s kontakt obrasca",
                intro: $"Zaprimljena je nova poruka putem kontakt obrasca.\n\nIme i prezime: {fullName}\nE-mail: {email}\n\nPoruka:\n{message}",
                ctaText: "Odgovori",
                ctaUrl: mailto,
                outro: "Ova poruka je automatski generirana.",
                logoUrl: "https://www.instalacije-quintus.hr/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75"
            );

            await _emailService.SendEmailAsync(to, subject, html);
        }
    }
}
