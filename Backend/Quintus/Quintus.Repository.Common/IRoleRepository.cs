using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IRoleRepository
    {
        Task<Role?> GetRoleByNameAsync(string roleName);

        Task<Role?> GetRoleByIdAsync(Guid roleId);

        Task<List<Role>> GetAllRolesAsync();
    }
}