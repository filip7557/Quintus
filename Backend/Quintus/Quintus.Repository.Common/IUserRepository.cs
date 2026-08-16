using Quintus.Model;
using Quintus.Model.Entities;
using Quintus.Common;

namespace Quintus.Repository.Common
{
    public interface IUserRepository
    {
        Task<bool> RegisterUserAsync(User user);

        Task<User?> GetUserByEmailAsync(string email);

        Task<User?> GetUserByIdAsync(Guid userId);

        Task<User?> GetUserByRefreshTokenAsync(string refreshToken);

        Task<User?> GetUserByEmailAndPasswordAsync(string email, string password);

        Task<bool> UpdateUserAsync(Guid userId, UserDTO updatedUser);

        Task<bool> DeleteUserAsync(Guid userId);

        Task<bool> SetEmailVerifiedAsync(Guid userId);

        Task<bool> SetPasswordHashAsync(Guid userId, string passwordHash);

        Task<bool> SetRoleAsync(Guid userId, Guid roleId);
        Task<bool> SetColorAsync(Guid userId, string color);
        Task<List<User>> GetUsersByRoleNameAsync(string roleName);
        Task<PagedResult<User>> GetUsersAsync(UserFilter filter);
    }
}