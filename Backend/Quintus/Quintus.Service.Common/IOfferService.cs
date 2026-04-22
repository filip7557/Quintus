using Quintus.Common;
using Quintus.Model.Entities;

namespace Quintus.Service.Common
{
    public interface IOfferService
    {
        Task<Offer?> GetOfferByIdAsync(Guid offerId);
        Task<PagedResult<Offer>> GetOffersAsync(OfferFilter filter);
        Task<KeyValuePair<Guid, byte[]>> AddOfferAsync(OfferDTO offer);
        Task<byte[]> GenerateOfferPdfAsync(Guid offerId);
        Task SendOfferEmailAsync(Guid offerId);
    }
}
