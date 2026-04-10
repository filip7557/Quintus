using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IUnitOfMeasurementRepository
    {
        Task<IEnumerable<UnitOfMeasurement>> GetAllAsync();
        Task<UnitOfMeasurement?> GetByIdAsync(Guid id);
        Task<UnitOfMeasurement?> AddAsync(UnitOfMeasurement unitOfMeasurement);
        Task<bool> DeleteAsync(Guid id);
    }
}
