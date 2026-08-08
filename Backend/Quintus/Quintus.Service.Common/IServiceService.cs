using Quintus.Model;

namespace Quintus.Service.Common
{
    public interface IServiceService
    {
        Task<List<Model.Entities.Service>> GetAllServicesAsync();
        Task AddServiceAsync(ServiceDTO service);
        Task UpdateServiceAsync(Guid id, ServiceDTO service);
        Task DeleteServiceAsync(Guid id);
    }
}
