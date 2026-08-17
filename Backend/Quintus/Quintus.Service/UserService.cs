using Quintus.Model;
using Quintus.Model.Entities;
using Quintus.Common;
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
                Role = user.Role,
                Id = user.Id,
                Color = NormalizeColor(user.Color)
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

        public async Task<PagedResult<UserDTO>> GetUsersAsync(UserFilter filter)
        {
            var result = await _userRepository.GetUsersAsync(filter);
            return new PagedResult<UserDTO>
            {
                Items = result.Items.Select(ToDto).ToList(),
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };
        }

        public async Task<List<Role>> GetRolesAsync()
        {
            return (await _roleRepository.GetAllRolesAsync())
                .OrderBy(role => role.Name)
                .ToList();
        }

        public async Task<bool> AssignRoleAsync(Guid userId, Guid roleId, string currentRole)
        {
            var role = await _roleRepository.GetRoleByIdAsync(roleId);
            if (role == null)
                return false;

            if (string.Equals(currentRole, "Owner", StringComparison.OrdinalIgnoreCase))
            {
                var targetUser = await _userRepository.GetUserByIdAsync(userId);
                var targetRoleName = targetUser?.Role?.Name;
                if (string.Equals(targetRoleName, "Admin", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(targetRoleName, "Owner", StringComparison.OrdinalIgnoreCase))
                    throw new UnauthorizedAccessException("Owneri ne mogu mijenjati uloge Admin ili Owner korisnika.");

                if (!string.Equals(role.Name, "Worker", StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(role.Name, "User", StringComparison.OrdinalIgnoreCase))
                    throw new UnauthorizedAccessException("Owneri mogu dodijeliti samo uloge Worker ili User.");
            }

            return await _userRepository.SetRoleAsync(userId, roleId);
        }

        public async Task<bool> UpdateColorAsync(Guid userId, string color, Guid currentUserId, string currentRole)
        {
            if (string.Equals(currentRole, "Owner", StringComparison.OrdinalIgnoreCase) && userId != currentUserId)
            {
                var targetUser = await _userRepository.GetUserByIdAsync(userId);
                var targetRoleName = targetUser?.Role?.Name;
                if (!string.Equals(targetRoleName, "Worker", StringComparison.OrdinalIgnoreCase))
                    throw new UnauthorizedAccessException("Owneri mogu mijenjati samo svoju boju ili boju Worker korisnika.");
            }

            return await _userRepository.SetColorAsync(userId, color);
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
                Role = u.Role,
                Color = NormalizeColor(u.Color)
            }).ToList();
        }

        private static UserDTO ToDto(User user)
        {
            return new UserDTO
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                Color = NormalizeColor(user.Color)
            };
        }

        private static string NormalizeColor(string? color)
        {
            return !string.IsNullOrWhiteSpace(color) &&
                System.Text.RegularExpressions.Regex.IsMatch(color, "^#[0-9A-Fa-f]{6}$")
                ? color
                : "#91120c";
        }
    }
}