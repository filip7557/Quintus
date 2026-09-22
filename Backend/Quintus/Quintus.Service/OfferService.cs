using Microsoft.Extensions.Logging;
using Quintus.Common;
using Quintus.Model;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;
using System.Diagnostics;

namespace Quintus.Service
{
    public class OfferService : IOfferService
    {
        private readonly IOfferRepository _offerRepository;
        private readonly PdfOfferService _pdfOfferService;
        private readonly IEmailQueue _emailQueue;
        private readonly ILogger<OfferService> _logger;

        public OfferService(IOfferRepository offerRepository, PdfOfferService pdfOfferService, IEmailQueue emailQueue, ILogger<OfferService> logger)
        {
            _offerRepository = offerRepository;
            _pdfOfferService = pdfOfferService;
            _emailQueue = emailQueue;
            _logger = logger;
        }

        public async Task<KeyValuePair<Guid, byte[]>> AddOfferAsync(OfferDTO offer)
        {
            var stopwatch = Stopwatch.StartNew();
            var offerYear = DateTime.UtcNow.Year;
            _logger.LogInformation(
                "Starting offer creation for {ItemCount} items. HasBuyerEmail: {HasBuyerEmail}, HasCustomMessage: {HasCustomMessage}.",
                offer.Items.Count,
                !string.IsNullOrWhiteSpace(offer.BuyerEmail),
                !string.IsNullOrWhiteSpace(offer.CustomMessage));

            var offerNumber = await _offerRepository.GetNextOfferNumberAsync(offerYear);

            var offerToCreate = new Offer
            {
                BuyerName = offer.BuyerName,
                BuyerEmail = offer.BuyerEmail,
                BuyerPhone = offer.BuyerPhone,
                CustomMessage = offer.CustomMessage,
                OfferYear = offerYear,
                OfferNumber = offerNumber,
                Items = offer.Items.Select(i => new Item { Name = i.Name, UnitOfMeasurement = i.UnitOfMeasurement, Quantity = i.Quantity, Price = i.Price, DiscountPercent = i.DiscountPercent }).ToList()
            };

            using var logScope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["OfferId"] = offerToCreate.Id,
                ["OfferNumber"] = offerNumber,
                ["OfferYear"] = offerYear
            });

            _logger.LogInformation(
                "Offer {OfferId} allocated number {OfferNumber}/{OfferYear}; sending it to the repository.",
                offerToCreate.Id,
                offerNumber,
                offerYear);
            var newOffer = await _offerRepository.AddOfferAsync(offerToCreate);
            if (newOffer == null)
            {
                _logger.LogError("Repository returned no offer after persisting offer {OfferId}.", offerToCreate.Id);
                return new KeyValuePair<Guid, byte[]>(Guid.Empty, Array.Empty<byte>());
            }

            if (!string.IsNullOrWhiteSpace(newOffer.BuyerEmail))
            {
                _emailQueue.Enqueue(new EmailJobItem(newOffer.Id, EmailJobType.Offer));
                _logger.LogInformation("Email job queued for offer {OfferId}.", newOffer.Id);
            }
            else
            {
                _logger.LogInformation(
                    "Email job skipped for offer {OfferId} because no buyer email was supplied.",
                    newOffer.Id);
            }

            _logger.LogInformation("Generating PDF for persisted offer {OfferId}.", newOffer.Id);
            var pdfBytes = await GenerateOfferPdfAsync(newOffer.Id);
            _logger.LogInformation(
                "Offer creation completed in {ElapsedMilliseconds} ms with a {PdfByteCount}-byte PDF.",
                stopwatch.ElapsedMilliseconds,
                pdfBytes.Length);
            return new KeyValuePair<Guid, byte[]>(newOffer.Id, pdfBytes);
        }

        public async Task<Offer?> GetOfferByIdAsync(Guid offerId) => await _offerRepository.GetOfferByIdAsync(offerId);

        public async Task<PagedResult<Offer>> GetOffersAsync(OfferFilter filter) => await _offerRepository.GetOffersAsync(filter);

        public async Task<byte[]> GenerateOfferPdfAsync(Guid offerId)
        {
            var stopwatch = Stopwatch.StartNew();
            _logger.LogInformation("Loading offer {OfferId} for PDF generation.", offerId);
            var offer = await _offerRepository.GetOfferByIdAsync(offerId);
            if (offer == null)
            {
                _logger.LogError("Offer {OfferId} was not available for PDF generation.", offerId);
                throw new KeyNotFoundException($"Ponuda s ID {offerId} nije pronadjena.");
            }

            var pdfBytes = await _pdfOfferService.GenerateOfferPdfAsync(offer);
            _logger.LogInformation(
                "PDF generation pipeline for offer {OfferId} completed in {ElapsedMilliseconds} ms.",
                offerId,
                stopwatch.ElapsedMilliseconds);
            return pdfBytes;
        }

        public Task SendOfferEmailAsync(Guid offerId)
        {
            _emailQueue.Enqueue(new EmailJobItem(offerId, EmailJobType.Offer));
            return Task.CompletedTask;
        }
    }
}