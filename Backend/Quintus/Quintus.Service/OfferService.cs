using Quintus.Model;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;
using System.Globalization;

namespace Quintus.Service
{
    public class OfferService : IOfferService
    {
        private readonly IOfferRepository _offerRepository;
        private readonly PdfOfferService _pdfOfferService;
        private readonly IEmailService _emailService;

        public OfferService(IOfferRepository offerRepository, PdfOfferService pdfOfferService, IEmailService emailService)
        {
            _offerRepository = offerRepository;
            _pdfOfferService = pdfOfferService;
            _emailService = emailService;
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
                            Quantity = i.Quantity,
                            Price = i.Price
                        }).ToList()
                    }
                );

            if (newOffer != null)
            {
                await SendOfferEmailAsync(newOffer.Id);
                return new KeyValuePair<Guid, byte[]>(newOffer.Id, await GenerateOfferPdfAsync(newOffer.Id));
            }

            return new KeyValuePair<Guid, byte[]>(Guid.Empty, Array.Empty<byte>());
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

        public async Task SendOfferEmailAsync(Guid offerId)
        {
            var offer = await _offerRepository.GetOfferByIdAsync(offerId);
            if (offer == null)
                throw new KeyNotFoundException($"Ponuda s ID {offerId} nije pronađena.");

            var pdfBytes = await _pdfOfferService.GenerateOfferPdfAsync(offer);

            var hrCulture = new CultureInfo("hr-HR");

            var subject = $"Vaša ponuda od {offer.CreatedAt.ToString("dd. MMMM yyyy.", hrCulture)}";
            var html = EmailTemplates.Build(
                title: "Vaša ponuda",
                intro: $"Poštovani {offer.BuyerName},\n\nU prilogu se nalazi Vaša ponuda.",
                outro: "Hvala što ste nas odabrali!",
                logoUrl: "https://quintus.fcuric.eu/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75"
            );

            await _emailService.SendEmailWithAttachmentAsync(
                offer.BuyerEmail,
                subject,
                html,
                pdfBytes,
                $"Ponuda_{offer.Id:N}.pdf"
            );
        }
    }
}