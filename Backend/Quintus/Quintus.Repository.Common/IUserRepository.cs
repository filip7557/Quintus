using Quintus.Model;
using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IUserRepository
    {
        Task<bool> RegisterUserAsync(User user);

        Task<User?> GetUserByEmailAsync(string email);

        Task<User?> GetUserByIdAsync(Guid userId);

        Task<User?> GetUserByEmailAndPasswordAsync(string email, string password);

        Task<bool> UpdateUserAsync(Guid userId, UserDTO updatedUser);

        Task<bool> DeleteUserAsync(Guid userId);
    }
}