using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class UnitOfMeasurementService : IUnitOfMeasurementService
    {
        private readonly IUnitOfMeasurementRepository _repository;

        public UnitOfMeasurementService(IUnitOfMeasurementRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<UnitOfMeasurement>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<UnitOfMeasurement?> GetByIdAsync(Guid id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<UnitOfMeasurement?> AddAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Unit of measurement name is required.");

            var unitOfMeasurement = new UnitOfMeasurement { Name = name.Trim() };
            return await _repository.AddAsync(unitOfMeasurement);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
}
