using Quintus.Model;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;

        public UserService(IUserRepository userRepository, IRoleRepository roleRepository)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
        }

        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            return await _userRepository.DeleteUserAsync(userId);
        }

        public async Task<User?> GetUserByEmailAndPasswordAsync(string email, string password)
        {
            return await _userRepository.GetUserByEmailAndPasswordAsync(email, password);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _userRepository.GetUserByEmailAsync(email);
        }

        public async Task<UserDTO?> GetUserByIdAsync(Guid userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            return user == null ? null : new UserDTO
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role
            };
        }

        public async Task<User?> GetUserByRefreshTokenAsync(string refreshToken)
        {
            return await _userRepository.GetUserByRefreshTokenAsync(refreshToken);
        }

        public async Task<bool> RegisterUserAsync(User user)
        {
            return await _userRepository.RegisterUserAsync(user);
        }

        public async Task<bool> UpdateUserAsync(Guid userId, UserDTO updatedUser)
        {
            return await _userRepository.UpdateUserAsync(userId, updatedUser);
        }

        public async Task<bool> PromoteToOwnerAsync(Guid userId)
        {
            var ownerRole = await _roleRepository.GetRoleByNameAsync("Owner");
            if (ownerRole == null)
                return false;

            return await _userRepository.SetRoleAsync(userId, ownerRole.Id);
        }

        public async Task<List<UserDTO>> GetOwnersAsync()
        {
            var owners = await _userRepository.GetUsersByRoleNameAsync("Owner");
            return owners.Select(u => new UserDTO
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role
            }).ToList();
        }
    }
}