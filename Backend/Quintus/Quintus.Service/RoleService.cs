using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;

        public RoleService(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        public async Task<List<Role>> GetAllRolesAsync()
        {
            return await _roleRepository.GetAllRolesAsync();
        }

        public async Task<Role> GetDefaultRoleAsync()
        {
            return await _roleRepository.GetRoleByNameAsync("User") ?? throw new Exception("Default role not found.");
        }

        public async Task<Role?> GetRoleByIdAsync(Guid roleId)
        {
            return await _roleRepository.GetRoleByIdAsync(roleId);
        }

        public async Task<Role?> GetRoleByNameAsync(string roleName)
        {
            return await _roleRepository.GetRoleByNameAsync(roleName);
        }
    }
}