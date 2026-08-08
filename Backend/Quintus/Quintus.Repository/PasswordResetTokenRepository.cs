using Microsoft.EntityFrameworkCore;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class PasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        private readonly AppDbContext _context;

        public PasswordResetTokenRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> SaveAsync(PasswordResetToken token)
        {
            _context.PasswordResetTokens.Add(token);
            return await _context.SaveChangesAsync() > 0;
        }

        public Task<PasswordResetToken?> GetActiveByTokenHashAsync(string tokenHash)
        {
            return _context.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TokenHash == tokenHash && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow);
        }

        public async Task<bool> MarkUsedAsync(PasswordResetToken token)
        {
            token.UsedAt = DateTime.UtcNow;
            _context.PasswordResetTokens.Update(token);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}