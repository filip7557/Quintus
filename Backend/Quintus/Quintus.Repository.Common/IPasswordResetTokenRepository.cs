using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IPasswordResetTokenRepository
    {
        Task<bool> SaveAsync(PasswordResetToken token);

        Task<PasswordResetToken?> GetActiveByTokenHashAsync(string tokenHash);

        Task<bool> MarkUsedAsync(PasswordResetToken token);
    }
}