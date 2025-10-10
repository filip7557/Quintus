using Quintus.Model;

namespace Quintus.Service.Common
{
    public interface IRequestService
    {
        Task<bool> CreateRequestAsync(RequestDTO request);

        Task<RequestResponseDTO?> GetRequestByIdAsync(Guid id);

        Task<IEnumerable<RequestResponseDTO>> GetAllRequestsAsync();
    }
}