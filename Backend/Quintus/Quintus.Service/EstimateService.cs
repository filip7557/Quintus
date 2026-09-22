using Microsoft.Extensions.Logging;
using Quintus.Common;
using Quintus.Model;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;
using System.Diagnostics;

namespace Quintus.Service
{
    public class EstimateService : IEstimateService
    {
        private readonly IEstimateRepository _estimateRepository;
        private readonly PdfEstimateService _pdfEstimateService;
        private readonly IEmailQueue _emailQueue;
        private readonly ILogger<EstimateService> _logger;

        public EstimateService(IEstimateRepository estimateRepository, PdfEstimateService pdfEstimateService, IEmailQueue emailQueue, ILogger<EstimateService> logger)
        {
            _estimateRepository = estimateRepository;
            _pdfEstimateService = pdfEstimateService;
            _emailQueue = emailQueue;
            _logger = logger;
        }

        public async Task<KeyValuePair<Guid, byte[]>> AddEstimateAsync(EstimateDTO estimate)
        {
            var stopwatch = Stopwatch.StartNew();
            var estimateYear = DateTime.UtcNow.Year;
            _logger.LogInformation(
                "Starting estimate creation for {ItemCount} items. HasBuyerEmail: {HasBuyerEmail}.",
                estimate.Items.Count,
                !string.IsNullOrEmpty(estimate.BuyerEmail));

            var estimateNumber = await _estimateRepository.GetNextEstimateNumberAsync(estimateYear);

            var estimateToCreate = new Estimate
            {
                Id = Guid.NewGuid(),
                Number = estimateNumber,
                Year = estimateYear,
                BuyerName = estimate.BuyerName,
                BuyerEmail = estimate.BuyerEmail,
                BuyerPhone = estimate.BuyerPhone,
                Items = estimate.Items.Select(i => new Item { Name = i.Name, UnitOfMeasurement = i.UnitOfMeasurement, Quantity = i.Quantity, Price = i.Price, DiscountPercent = i.DiscountPercent }).ToList(),
                IsTransactional = estimate.IsTransactional,
            };

            using var logScope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["EstimateId"] = estimateToCreate.Id,
                ["EstimateNumber"] = estimateNumber,
                ["EstimateYear"] = estimateYear
            });

            _logger.LogInformation(
                "Estimate {EstimateId} allocated number {EstimateNumber}/{EstimateYear}; sending it to the repository;",
                estimateToCreate.Id,
                estimateNumber,
                estimateYear);
            var newEstimate = await _estimateRepository.AddEstimateAsync(estimateToCreate);
            if (newEstimate == null)
            {
                _logger.LogError("Repository returned no estimate after persisting estimate {EstimateId}.", estimateToCreate.Id);
                return new KeyValuePair<Guid, byte[]>(Guid.Empty, Array.Empty<byte>());
            }

            if (!string.IsNullOrWhiteSpace(newEstimate.BuyerEmail))
            {
                _emailQueue.Enqueue(new EmailJobItem(newEstimate.Id, EmailJobType.Estimate));
                _logger.LogInformation("Email job queued for estimate {EstimateId}.", newEstimate.Id);
            }
            else
            {
                _logger.LogInformation(
                    "Email job skipped for estimate {EstimateId} because no buyer email was provided.",
                    newEstimate.Id);
            }

            _logger.LogInformation("Generating PDF for persisted estimate {EstimateId}.", newEstimate.Id);
            var pdfBytes = await _pdfEstimateService.GeneratePdfAsync(newEstimate.Id);
            _logger.LogInformation(
                "Estimate creation completed in {ElapsedMilliseconds} ms with a {PdfByteCount}-byte PDF.",
                stopwatch.ElapsedMilliseconds,
                pdfBytes.Length);
            return new KeyValuePair<Guid, byte[]>(newEstimate.Id, pdfBytes);
        }

        public async Task<byte[]> GenerateEstimatePdfAsync(Guid estimateId)
        {
            var stopwatch = Stopwatch.StartNew();
            _logger.LogInformation("Loading estimate {EstimateId} for PDF generation.", estimateId);
            var estimate = await _estimateRepository.GetEstimateByIdAsync(estimateId);
            if (estimate == null)
            {
                _logger.LogError("Estimate {EstimateId} was not available for PDF generation.", estimateId);
                throw new KeyNotFoundException($"Predračun s ID {estimateId} nije pronađen.");
            }

            var pdfBytes = await _pdfEstimateService.GeneratePdfAsync(estimateId);
            _logger.LogInformation(
                "PDF generation pipeline for estimate {EstimateId} completed in {ElapsedMilliseconds} ms.",
                estimateId,
                stopwatch.ElapsedMilliseconds);
            return pdfBytes;
        }

        public async Task<Estimate?> GetEstimateByIdAsync(Guid estimateId)
        {
            return await _estimateRepository.GetEstimateByIdAsync(estimateId);
        }

        public async Task<PagedResult<Estimate>> GetEstimatesAsync(OfferFilter filter)
        {
            return await _estimateRepository.GetEstimatesAsync(filter);
        }

        public Task SendEstimateEmailAsync(Guid estimateId)
        {
            _emailQueue.Enqueue(new EmailJobItem(estimateId, EmailJobType.Estimate));
            return Task.CompletedTask;
        }
    }
}