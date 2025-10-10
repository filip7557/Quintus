using Microsoft.EntityFrameworkCore;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class RequestRepository : IRequestRepository
    {
        private readonly AppDbContext _context;

        public RequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddRequestAsync(Request request)
        {
            try
            {
                _context.Requests.Add(request);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception occured while adding request: {ex.Message}");
                return false;
            }
        }

        public async Task<IEnumerable<Request>> GetAllRequestsAsync()
        {
            try
            {
                // TODO: Add filtering and sorting capabilities.
                return await _context.Requests.Include(r => r.Images).Include(r => r.RequestedBy).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception occured while fetching all requests: {ex.Message}");
                return Enumerable.Empty<Request>();
            }
        }

        public async Task<Request?> GetRequestByIdAsync(Guid id)
        {
            try
            {
                return await _context.Requests.Include(r => r.Images).Include(r => r.RequestedBy).FirstOrDefaultAsync(r => r.Id == id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception occured while fetching request by id: {ex.Message}");
                return null;
            }
        }
    }
}