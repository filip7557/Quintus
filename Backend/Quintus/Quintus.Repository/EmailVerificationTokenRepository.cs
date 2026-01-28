using Microsoft.EntityFrameworkCore;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class EmailVerificationTokenRepository : IEmailVerificationTokenRepository
    {
        private readonly AppDbContext _context;

        public EmailVerificationTokenRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> SaveAsync(EmailVerificationToken token)
        {
            _context.EmailVerificationTokens.Add(token);
            return await _context.SaveChangesAsync() > 0;
        }

        public Task<EmailVerificationToken?> GetActiveByTokenHashAsync(string tokenHash)
        {
            return _context.EmailVerificationTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TokenHash == tokenHash && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow);
        }

        public async Task<bool> MarkUsedAsync(EmailVerificationToken token)
        {
            token.UsedAt = DateTime.UtcNow;
            _context.EmailVerificationTokens.Update(token);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
