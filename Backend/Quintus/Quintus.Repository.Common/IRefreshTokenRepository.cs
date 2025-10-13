using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IRefreshTokenRepository
    {
        Task<bool> SaveRefreshTokenAsync(RefreshToken refreshToken);

        Task<bool> RevokeRefreshTokenAsync(RefreshToken refreshToken);

        Task<List<RefreshToken>> GetActiveRefreshTokensByUser(User user);
    }
}