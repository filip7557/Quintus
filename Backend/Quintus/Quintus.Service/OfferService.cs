using Quintus.Model;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class OfferService : IOfferService
    {
        private readonly IOfferRepository _offerRepository;
        private readonly PdfOfferService _pdfOfferService;
        private readonly IEmailQueue _emailQueue;

        public OfferService(IOfferRepository offerRepository, PdfOfferService pdfOfferService, IEmailQueue emailQueue)
        {
            _offerRepository = offerRepository;
            _pdfOfferService = pdfOfferService;
            _emailQueue = emailQueue;
        }

        public async Task<KeyValuePair<Guid, byte[]>> AddOfferAsync(OfferDTO offer)
        {
            var newOffer = await _offerRepository.AddOfferAsync
                (
                    new Offer
                    {
                        BuyerName = offer.BuyerName,
                        BuyerEmail = offer.BuyerEmail,
                        BuyerPhone = offer.BuyerPhone,
                        Items = offer.Items.Select(i => new Item
                        {
                            Name = i.Name,
                            UnitOfMeasurement = i.UnitOfMeasurement,
                            Quantity = i.Quantity,
                            Price = i.Price
                        }).ToList()
                    }
                );

            if (newOffer == null)
                return new KeyValuePair<Guid, byte[]>(Guid.Empty, Array.Empty<byte>());

            if (newOffer.BuyerEmail != null)
                _emailQueue.Enqueue(new EmailJobItem(newOffer.Id));

            return new KeyValuePair<Guid, byte[]>(newOffer.Id, await GenerateOfferPdfAsync(newOffer.Id));
        }

        public async Task<Offer?> GetOfferByIdAsync(Guid offerId)
        {
            return await _offerRepository.GetOfferByIdAsync(offerId);
        }

        public async Task<IEnumerable<Offer>> GetOffersByBuyerEmailAsync(string buyerEmail)
        {
            return await _offerRepository.GetOffersByBuyerEmailAsync(buyerEmail);
        }

        public async Task<IEnumerable<Offer>> GetOffersByBuyerNameAsync(string buyerName)
        {
            return await _offerRepository.GetOffersByBuyerNameAsync(buyerName);
        }

        public async Task<byte[]> GenerateOfferPdfAsync(Guid offerId)
        {
            var offer = await _offerRepository.GetOfferByIdAsync(offerId);
            if (offer == null)
                throw new KeyNotFoundException($"Ponuda s ID {offerId} nije pronađena.");

            return await _pdfOfferService.GenerateOfferPdfAsync(offer);
        }

        public Task SendOfferEmailAsync(Guid offerId)
        {
            _emailQueue.Enqueue(new EmailJobItem(offerId));
            return Task.CompletedTask;
        }
    }
}