using Quintus.Model.Entities;

namespace Quintus.Service.Common
{
    public interface IOfferService
    {
        Task<Offer?> GetOfferByIdAsync(Guid offerId);
        Task<IEnumerable<Offer>> GetOffersByBuyerNameAsync(string buyerName);
        Task<IEnumerable<Offer>> GetOffersByBuyerEmailAsync(string buyerEmail);
        Task<KeyValuePair<Guid, byte[]>> AddOfferAsync(OfferDTO offer);
        Task<byte[]> GenerateOfferPdfAsync(Guid offerId);
        Task SendOfferEmailAsync(Guid offerId);
    }
}
