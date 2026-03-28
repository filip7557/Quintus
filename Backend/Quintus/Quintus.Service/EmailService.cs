using Microsoft.Extensions.Configuration;
using Quintus.Service.Common;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Quintus.Service
{
    public class EmailService : IEmailService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public EmailService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
        {
            var apiKey = _config["Brevo:ApiKey"];
            var fromEmail = _config["Brevo:FromEmail"];
            var fromName = _config["Brevo:FromName"] ?? "Quintus";

            if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(fromEmail))
                throw new InvalidOperationException("Brevo settings are missing (Brevo:ApiKey / Brevo:FromEmail).");

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Add("api-key", apiKey);

            var payload = new
            {
                sender = new { email = fromEmail, name = fromName },
                to = new[] { new { email = toEmail } },
                subject,
                htmlContent
            };

            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            using var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                throw new InvalidOperationException($"Brevo send failed: {(int)response.StatusCode} {response.ReasonPhrase}. {body}");
            }
        }

        public async Task SendEmailWithAttachmentAsync(string toEmail, string subject, string htmlContent, byte[] attachmentData, string attachmentFileName)
        {
            var apiKey = _config["Brevo:ApiKey"];
            var fromEmail = _config["Brevo:FromEmail"];
            var fromName = _config["Brevo:FromName"] ?? "Quintus";

            if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(fromEmail))
                throw new InvalidOperationException("Brevo settings are missing (Brevo:ApiKey / Brevo:FromEmail).");

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Add("api-key", apiKey);

            var payload = new
            {
                sender = new { email = fromEmail, name = fromName },
                to = new[] { new { email = toEmail } },
                subject,
                htmlContent,
                attachment = new[]
                {
                    new
                    {
                        content = Convert.ToBase64String(attachmentData),
                        name = attachmentFileName
                    }
                }
            };

            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            using var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                throw new InvalidOperationException($"Brevo send failed: {(int)response.StatusCode} {response.ReasonPhrase}. {body}");
            }
        }
    }
}