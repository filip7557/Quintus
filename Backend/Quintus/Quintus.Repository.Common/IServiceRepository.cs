using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IServiceRepository
    {
            Task<List<Service>> GetAllServicesAsync();
            Task AddServiceAsync(Service service);
            Task UpdateServiceAsync(Service service);
            Task DeleteServiceAsync(Guid id);
    }
}
