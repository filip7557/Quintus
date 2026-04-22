using Quintus.Common;
using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IOfferRepository
    {
        Task<Offer?> GetOfferByIdAsync(Guid offerId);
        Task<PagedResult<Offer>> GetOffersAsync(OfferFilter filter);
        Task<Offer?> AddOfferAsync(Offer offer);
    }
}
