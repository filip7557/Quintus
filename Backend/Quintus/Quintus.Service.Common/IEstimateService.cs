using Quintus.Common;
using Quintus.Model.Entities;

namespace Quintus.Service.Common
{
    public interface IEstimateService
    {
        Task<Estimate?> GetEstimateByIdAsync(Guid estimateId);

        Task<PagedResult<Estimate>> GetEstimatesAsync(OfferFilter filter);

        Task<KeyValuePair<Guid, byte[]>> AddEstimateAsync(EstimateDTO estimate);

        Task<byte[]> GenerateEstimatePdfAsync(Guid estimateId);

        Task SendEstimateEmailAsync(Guid estimateId);
    }
}