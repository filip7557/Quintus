using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Quintus.Common;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;
using System.Diagnostics;

namespace Quintus.Repository
{
    public class EstimateRepository : IEstimateRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<EstimateRepository> _logger;

        public EstimateRepository(AppDbContext context, ILogger<EstimateRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Estimate?> AddEstimateAsync(Estimate estimate)
        {
            var stopwatch = Stopwatch.StartNew();
            _logger.LogInformation(
                "Persisting estimate {EstimateId} with number {EstimateNumber}/{EstimateYear} and {ItemCount} items.",
                estimate.Id,
                estimate.Number,
                estimate.Year,
                estimate.Items.Count);

            try
            {
                _context.Estimates.Add(estimate);
                await _context.SaveChangesAsync();
                stopwatch.Stop();
                _logger.LogInformation(
                    "Estimate {EstimateId} persisted in {ElapsedMilliseconds} ms.",
                    estimate.Id,
                    stopwatch.ElapsedMilliseconds);
                return estimate;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(
                    ex,
                    "Error persisting estimate {EstimateId} in {ElapsedMilliseconds} ms.",
                    estimate.Id,
                    stopwatch.ElapsedMilliseconds);
                return null;
            }
        }

        public async Task<Estimate?> GetEstimateByIdAsync(Guid estimateId)
        {
            var stopwatch = Stopwatch.StartNew();
            _logger.LogInformation("Retrieving estimate {EstimateId}.", estimateId);
            try
            {
                var estimate = await _context.Estimates
                    .Include(e => e.Items)
                    .FirstOrDefaultAsync(e => e.Id == estimateId);
                stopwatch.Stop();
                _logger.LogInformation("Estimate {EstimateId} retrieved in {ElapsedMilliseconds} ms.", estimateId, stopwatch.ElapsedMilliseconds);
                return estimate;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(ex, "Error retrieving estimate {EstimateId} in {ElapsedMilliseconds} ms.", estimateId, stopwatch.ElapsedMilliseconds);
                return null;
            }
        }

        public async Task<PagedResult<Estimate>> GetEstimatesAsync(OfferFilter filter)
        {
            var query = _context.Estimates.Include(e => e.Items).AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var searchLower = filter.Search.ToLower();
                query = query.Where(o =>
                   o.BuyerName.ToLower().Contains(searchLower) ||
                    (o.BuyerEmail != null && o.BuyerEmail.ToLower().Contains(searchLower)) ||
                    (o.BuyerPhone != null && o.BuyerPhone.ToLower().Contains(searchLower)));
            }

            if (filter.DateFrom.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= filter.DateFrom.Value);
            }

            if (filter.DateTo.HasValue)
            {
                query = query.Where(o => o.CreatedAt <= filter.DateTo.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<Estimate>
            {
                Items = items,
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize
            };
        }

        public async Task<int> GetNextEstimateNumberAsync(int estimateYear)
        {
            _logger.LogInformation("Resolving next estimate number for year {EstimateYear}.", estimateYear);
            var currentMax = await _context.Estimates
                .Where(e => e.Year == estimateYear)
                .MaxAsync(e => (int?)e.Number);

            var nextNumber = (currentMax ?? 0) + 1;
            _logger.LogInformation("Next estimate number for year {EstimateYear} is {NextNumber}.", estimateYear, nextNumber);
            return nextNumber;
        }
    }
}