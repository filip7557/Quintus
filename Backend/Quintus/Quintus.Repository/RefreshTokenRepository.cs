using Microsoft.EntityFrameworkCore;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly AppDbContext _context;

        public RefreshTokenRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<RefreshToken>> GetActiveRefreshTokensByUser(User user)
        {
            return await _context.RefreshTokens
                .Where(rt => rt.User == user && rt.Revoked == null && rt.Expires > DateTime.UtcNow)
                .ToListAsync();
        }

        public async Task<bool> RevokeRefreshTokenAsync(RefreshToken refreshToken)
        {
            refreshToken.Revoked = DateTime.UtcNow;
            _context.RefreshTokens.Update(refreshToken);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> SaveRefreshTokenAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Add(refreshToken);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}