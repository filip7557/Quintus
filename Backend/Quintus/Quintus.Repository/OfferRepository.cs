using Microsoft.EntityFrameworkCore;
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

        public async Task<IEnumerable<Offer>> GetOffersByBuyerEmailAsync(string buyerEmail)
        {
            try
            {
                return await _context.Offers
                    .Where(o => o.BuyerEmail == buyerEmail)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving offers by buyer email: {ex.Message}");
                return Enumerable.Empty<Offer>();
            }
        }

        public async Task<IEnumerable<Offer>> GetOffersByBuyerNameAsync(string buyerName)
        {
            try
            {
                return await _context.Offers
                    .Where(o => o.BuyerName.ToLower().Contains(buyerName.ToLower()))
                    .ToListAsync();

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving offers by buyer name: {ex.Message}");
                return Enumerable.Empty<Offer>();
            }
        }
    }
}
