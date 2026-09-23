using Quintus.Common;
using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IEstimateRepository
    {
        Task<Estimate?> GetEstimateByIdAsync(Guid estimateId);

        Task<PagedResult<Estimate>> GetEstimatesAsync(OfferFilter filter);

        Task<int> GetNextEstimateNumberAsync(int estimateYear);

        Task<Estimate?> AddEstimateAsync(Estimate estimate);
    }
}