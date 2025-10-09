using Quintus.Model.Entities;

namespace Quintus.Service.Common
{
    public interface IRoleService
    {
        Task<Role?> GetRoleByNameAsync(string roleName);

        Task<Role?> GetRoleByIdAsync(Guid roleId);

        Task<List<Role>> GetAllRolesAsync();

        Task<Role> GetDefaultRoleAsync();
    }
}