using Microsoft.EntityFrameworkCore;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class UnitOfMeasurementRepository : IUnitOfMeasurementRepository
    {
        private readonly AppDbContext _context;

        public UnitOfMeasurementRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UnitOfMeasurement>> GetAllAsync()
        {
            return await _context.UnitsOfMeasurement.ToListAsync();
        }

        public async Task<UnitOfMeasurement?> GetByIdAsync(Guid id)
        {
            return await _context.UnitsOfMeasurement.FindAsync(id);
        }

        public async Task<UnitOfMeasurement?> AddAsync(UnitOfMeasurement unitOfMeasurement)
        {
            try
            {
                _context.UnitsOfMeasurement.Add(unitOfMeasurement);
                await _context.SaveChangesAsync();
                return unitOfMeasurement;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding unit of measurement: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.UnitsOfMeasurement.FindAsync(id);
            if (entity == null) return false;

            _context.UnitsOfMeasurement.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
