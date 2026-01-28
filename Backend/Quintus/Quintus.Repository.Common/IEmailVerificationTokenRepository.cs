using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IEmailVerificationTokenRepository
    {
        Task<bool> SaveAsync(EmailVerificationToken token);
        Task<EmailVerificationToken?> GetActiveByTokenHashAsync(string tokenHash);
        Task<bool> MarkUsedAsync(EmailVerificationToken token);
    }
}
