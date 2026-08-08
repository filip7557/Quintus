using Microsoft.EntityFrameworkCore;
using Quintus.Common;
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

        public async Task<PagedResult<Request>> GetRequestsAsync(RequestFilter filter)
        {
            var query = _context.Requests
                .Include(r => r.Images)
                .Include(r => r.RequestedBy)
                .AsQueryable();

            if (filter.DateFrom.HasValue)
                query = query.Where(r => r.CreatedAt >= filter.DateFrom.Value);

            if (filter.DateTo.HasValue)
                query = query.Where(r => r.CreatedAt <= filter.DateTo.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<Request>
            {
                Items = items,
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize
            };
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