using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Quintus.Service;
using Quintus.Service.Common;
using System.Globalization;

namespace Quintus.Worker
{
    public class EmailWorkerService : BackgroundService
    {
        private readonly IEmailQueue _emailQueue;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<EmailWorkerService> _logger;

        public EmailWorkerService(IEmailQueue emailQueue, IServiceScopeFactory scopeFactory, ILogger<EmailWorkerService> logger)
        {
            _emailQueue = emailQueue;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await foreach (var job in _emailQueue.Reader.ReadAllAsync(stoppingToken))
            {
                try
                {
                    await using var scope = _scopeFactory.CreateAsyncScope();
                    var offerService = scope.ServiceProvider.GetRequiredService<IOfferService>();
                    var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                    var offer = await offerService.GetOfferByIdAsync(job.OfferId);
                    if (offer == null)
                    {
                        _logger.LogWarning("Email job skipped: offer {OfferId} not found.", job.OfferId);
                        continue;
                    }

                    if (offer.BuyerEmail == null)
                    {
                        _logger.LogWarning("Email job skipped: offer {OfferId} has no buyer email.", job.OfferId);
                        continue;
                    }

                    var pdfBytes = await offerService.GenerateOfferPdfAsync(job.OfferId);

                    var hrCulture = new CultureInfo("hr-HR");
                    var subject = $"Vaša ponuda od {offer.CreatedAt.ToString("dd. MMMM yyyy.", hrCulture)}";
                    var html = EmailTemplates.Build(
                        title: "Vaša ponuda",
                        intro: $"Poštovani {offer.BuyerName},\n\nU prilogu se nalazi Vaša ponuda.",
                        outro: "Hvala što ste nas odabrali!",
                        logoUrl: "https://quintus.fcuric.eu/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75"
                    );

                    await emailService.SendEmailWithAttachmentAsync(
                        offer.BuyerEmail,
                        subject,
                        html,
                        pdfBytes,
                        $"Ponuda_{offer.Id:N}.pdf"
                    );

                    _logger.LogInformation("Email sent to {ToEmail} for offer {OfferId}.", offer.BuyerEmail, job.OfferId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process email job for offer {OfferId}.", job.OfferId);
                }
            }
        }
    }
}
