using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IRequestRepository
    {
        Task<bool> AddRequestAsync(Request request);

        Task<Request?> GetRequestByIdAsync(Guid id);

        Task<IEnumerable<Request>> GetAllRequestsAsync();
    }
}