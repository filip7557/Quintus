using Quintus.Model;
using Quintus.Model.Entities;

namespace Quintus.Service.Common
{
    public interface IUserService
    {
        Task<bool> RegisterUserAsync(User user);

        Task<User?> GetUserByEmailAsync(string email);

        Task<UserDTO?> GetUserByIdAsync(Guid userId);

        Task<User?> GetUserByEmailAndPasswordAsync(string email, string password);

        Task<User?> GetUserByRefreshTokenAsync(string refreshToken);

        Task<bool> UpdateUserAsync(Guid userId, UserDTO updatedUser);

        Task<bool> DeleteUserAsync(Guid userId);
    }
}