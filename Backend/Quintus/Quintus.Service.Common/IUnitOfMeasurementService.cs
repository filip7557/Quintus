using Quintus.Model.Entities;

namespace Quintus.Service.Common
{
    public interface IUnitOfMeasurementService
    {
        Task<IEnumerable<UnitOfMeasurement>> GetAllAsync();
        Task<UnitOfMeasurement?> GetByIdAsync(Guid id);
        Task<UnitOfMeasurement?> AddAsync(string name);
        Task<bool> DeleteAsync(Guid id);
    }
}
