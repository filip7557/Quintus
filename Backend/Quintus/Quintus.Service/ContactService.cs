using System.Text;
using Microsoft.Extensions.Configuration;
using Quintus.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class ContactService : IContactService
    {
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;

        public ContactService(IEmailService emailService, IConfiguration config)
        {
            _emailService = emailService;
            _config = config;
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

            var to = _config["App:ContactEmail"];
            if (string.IsNullOrWhiteSpace(to))
                throw new InvalidOperationException("Nedostaje konfiguracija App:ContactEmail.");

            var mailto = $"mailto:{to}";

            var subject = $"Kontakt (web): {fullName}";

            var intro = "Zaprimljena je nova poruka putem kontakt obrasca.";
            var body = new StringBuilder();
            body.AppendLine(intro);
            body.AppendLine();
            body.AppendLine($"Ime i prezime: {fullName}");
            body.AppendLine($"E-mail: {email}");
            body.AppendLine();
            body.AppendLine("Poruka:");
            body.AppendLine(message);

            var html = EmailTemplates.Build(
                title: "Nova poruka s kontakt obrasca",
                intro: $"Zaprimljena je nova poruka putem kontakt obrasca.\n\nIme i prezime: {fullName}\nE-mail: {email}\n\nPoruka:\n{message}",
                ctaText: "Odgovori",
                ctaUrl: mailto,
                outro: "Ova poruka je automatski generirana.",
                logoUrl: "https://quintus.fcuric.eu/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75"
            );

            await _emailService.SendEmailAsync(to, subject, html);
        }
    }
}
