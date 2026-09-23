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
                    var estimateService = scope.ServiceProvider.GetRequiredService<IEstimateService>();
                    var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                    var hrCulture = new CultureInfo("hr-HR");

                    switch (job.jobType)
                    {
                        case EmailJobType.Offer:
                        {
                            var offer = await offerService.GetOfferByIdAsync(job.entityId);
                            if (offer == null)
                            {
                                _logger.LogWarning("Email job skipped: entity {EntityId} not found.", job.entityId);
                                break;
                            }

                            if (offer.BuyerEmail == null)
                            {
                                _logger.LogWarning("Email job skipped: entity {EntityId} has no buyer email.", job.entityId);
                                break;
                            }

                            var pdfBytes = await offerService.GenerateOfferPdfAsync(job.entityId);
                            var subject = $"Vaša ponuda od {offer.CreatedAt.ToString("dd. MMMM yyyy.", hrCulture)}";
                            var html = EmailTemplates.Build(
                                title: "Vaša ponuda",
                                intro: $"Poštovani {offer.BuyerName},\n\nU prilogu se nalazi Vaša ponuda.",
                                outro: "Hvala što ste nas odabrali!",
                                logoUrl: "https://www.instalacije-quintus.hr/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75"
                            );

                            await emailService.SendEmailWithAttachmentAsync(
                                offer.BuyerEmail,
                                subject,
                                html,
                                pdfBytes,
                                OfferFileNameFormatter.GetFileName(offer)
                            );

                            _logger.LogInformation("Email sent to {ToEmail} for entity {EntityId}.", offer.BuyerEmail, job.entityId);
                            break;
                        }

                        case EmailJobType.Estimate:
                        {
                            var estimate = await estimateService.GetEstimateByIdAsync(job.entityId);
                            if (estimate == null)
                            {
                                _logger.LogWarning("Email job skipped: entity {EntityId} not found.", job.entityId);
                                break;
                            }

                            if (estimate.BuyerEmail == null)
                            {
                                _logger.LogWarning("Email job skipped: entity {EntityId} has no buyer email.", job.entityId);
                                break;
                            }

                            var pdfBytes = await estimateService.GenerateEstimatePdfAsync(job.entityId);
                            var subject = $"Vaša procjena od {estimate.CreatedAt.ToString("dd. MMMM yyyy.", hrCulture)}";
                            var html = EmailTemplates.Build(
                                title: "Vaš predračun",
                                intro: $"Poštovani {estimate.BuyerName},\n\nU prilogu se nalazi Vaš predračun.",
                                outro: "Hvala što ste nas odabrali!",
                                logoUrl: "https://www.instalacije-quintus.hr/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75"
                            );

                            await emailService.SendEmailWithAttachmentAsync(
                                estimate.BuyerEmail,
                                subject,
                                html,
                                pdfBytes,
                                EstimateFileNameFormatter.GetFileName(estimate)
                            );

                            _logger.LogInformation("Email sent to {ToEmail} for entity {EntityId}.", estimate.BuyerEmail, job.entityId);
                            break;
                        }

                        default:
                            throw new NotSupportedException($"Unsupported job type: {job.jobType}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process email job for entity {EntityId}.", job.entityId);
                }
            }
        }
    }
}
