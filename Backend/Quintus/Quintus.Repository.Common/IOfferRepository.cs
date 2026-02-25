using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IOfferRepository
    {
            Task<Offer?> GetOfferByIdAsync(Guid offerId);
            Task<IEnumerable<Offer>> GetOffersByBuyerNameAsync(string buyerName);
            Task<IEnumerable<Offer>> GetOffersByBuyerEmailAsync(string buyerEmail);
            Task<Offer?> AddOfferAsync(Offer offer);
    }
}
