using Quintus.Model;
using Quintus.Model.Entities;

namespace Quintus.Service.Common
{
    public interface IUserService
    {
        Task<bool> DeleteUserAsync(Guid userId);
        Task<User?> GetUserByEmailAndPasswordAsync(string email, string password);
        Task<User?> GetUserByEmailAsync(string email);
        Task<UserDTO?> GetUserByIdAsync(Guid userId);
        Task<User?> GetUserByRefreshTokenAsync(string refreshToken);
        Task<bool> RegisterUserAsync(User user);
        Task<bool> UpdateUserAsync(Guid userId, UserDTO updatedUser);

        Task<bool> PromoteToOwnerAsync(Guid userId);
        Task<List<UserDTO>> GetOwnersAsync();
    }
}