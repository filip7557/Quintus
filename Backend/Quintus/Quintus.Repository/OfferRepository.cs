using Microsoft.EntityFrameworkCore;
using Quintus.Common;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class OfferRepository : IOfferRepository
    {
        private readonly AppDbContext _context;

        public OfferRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Offer?> AddOfferAsync(Offer offer)
        {
            try
            {
                _context.Offers.Add(offer);
                await _context.SaveChangesAsync();
                return offer;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding offer: {ex.Message}");
                throw;
            }
        }

        public async Task<int> GetNextOfferNumberAsync(int offerYear)
        {
            var currentMax = await _context.Offers
                .Where(o => o.OfferYear == offerYear)
                .MaxAsync(o => (int?)o.OfferNumber);

            return (currentMax ?? 0) + 1;
        }

        public async Task<Offer?> GetOfferByIdAsync(Guid offerId)
        {
            try
            {
                return await _context.Offers
                    .Include(o => o.Items)
                    .FirstOrDefaultAsync(o => o.Id == offerId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving offer by ID: {ex.Message}");
                return null;
            }
        }

        public async Task<PagedResult<Offer>> GetOffersAsync(OfferFilter filter)
        {
            var query = _context.Offers.Include(o => o.Items).AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var search = filter.Search.ToLower();
                query = query.Where(o =>
                    o.BuyerName.ToLower().Contains(search) ||
                    (o.BuyerEmail != null && o.BuyerEmail.ToLower().Contains(search)));
            }

            if (filter.DateFrom.HasValue)
                query = query.Where(o => o.CreatedAt >= filter.DateFrom.Value);

            if (filter.DateTo.HasValue)
                query = query.Where(o => o.CreatedAt <= filter.DateTo.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<Offer>
            {
                Items = items,
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize
            };
        }
    }
}
