using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Quintus.Common;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;
using System.Diagnostics;

namespace Quintus.Repository
{
    public class OfferRepository : IOfferRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<OfferRepository> _logger;

        public OfferRepository(AppDbContext context, ILogger<OfferRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Offer?> AddOfferAsync(Offer offer)
        {
            var stopwatch = Stopwatch.StartNew();
            _logger.LogInformation(
                "Persisting offer {OfferId} with number {OfferNumber}/{OfferYear} and {ItemCount} items.",
                offer.Id,
                offer.OfferNumber,
                offer.OfferYear,
                offer.Items.Count);

            try
            {
                _context.Offers.Add(offer);
                await _context.SaveChangesAsync();
                _logger.LogInformation(
                    "Persisted offer {OfferId} in {ElapsedMilliseconds} ms.",
                    offer.Id,
                    stopwatch.ElapsedMilliseconds);
                return offer;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to persist offer {OfferId} with number {OfferNumber}/{OfferYear} after {ElapsedMilliseconds} ms.",
                    offer.Id,
                    offer.OfferNumber,
                    offer.OfferYear,
                    stopwatch.ElapsedMilliseconds);
                throw;
            }
        }

        public async Task<int> GetNextOfferNumberAsync(int offerYear)
        {
            _logger.LogInformation("Resolving next offer number for year {OfferYear}.", offerYear);
            var currentMax = await _context.Offers
                .Where(o => o.OfferYear == offerYear)
                .MaxAsync(o => (int?)o.OfferNumber);

            var nextNumber = (currentMax ?? 0) + 1;
            _logger.LogInformation(
                "Resolved next offer number {OfferNumber}/{OfferYear}.",
                nextNumber,
                offerYear);
            return nextNumber;
        }

        public async Task<Offer?> GetOfferByIdAsync(Guid offerId)
        {
            var stopwatch = Stopwatch.StartNew();
            _logger.LogInformation("Loading offer {OfferId} with items.", offerId);

            try
            {
                var offer = await _context.Offers
                    .Include(o => o.Items)
                    .FirstOrDefaultAsync(o => o.Id == offerId);

                _logger.LogInformation(
                    "Offer {OfferId} load completed in {ElapsedMilliseconds} ms. Found: {OfferFound}, ItemCount: {ItemCount}.",
                    offerId,
                    stopwatch.ElapsedMilliseconds,
                    offer != null,
                    offer?.Items.Count ?? 0);
                return offer;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to load offer {OfferId} after {ElapsedMilliseconds} ms.",
                    offerId,
                    stopwatch.ElapsedMilliseconds);
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
