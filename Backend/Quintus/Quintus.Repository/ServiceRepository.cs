using Microsoft.EntityFrameworkCore;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class ServiceRepository : IServiceRepository
    {
        private readonly AppDbContext _context;

        public ServiceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddServiceAsync(Service service)
        {
            await _context.Services.AddAsync(service);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteServiceAsync(Guid id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service != null)
            {
                _context.Services.Remove(service);
                await _context.SaveChangesAsync();

            }
        }

        public async Task<List<Service>> GetAllServicesAsync()
        {
            return await _context.Services.ToListAsync();
        }

        public Task<Service?> GetServiceByIdAsync(Guid id)
        {
            return _context.Services.FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task UpdateServiceAsync(Service service)
        {
            await _context.Services.Where(s => s.Id == service.Id)
                .ForEachAsync(s =>
                {
                    s.Title = service.Title;
                    s.Description = service.Description;
                    s.ImageUrls = service.ImageUrls;
                    s.KeyWords = service.KeyWords;
                });

            await _context.SaveChangesAsync();
        }
    }
}
