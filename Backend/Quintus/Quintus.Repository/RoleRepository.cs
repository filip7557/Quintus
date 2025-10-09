using Microsoft.EntityFrameworkCore;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class RoleRepository : IRoleRepository
    {
        private readonly AppDbContext _context;

        public RoleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Role>> GetAllRolesAsync()
        {
            try
            {
                return await _context.Roles.ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while retrieving roles: {ex.Message}");
                return new List<Role>();
            }
        }

        public async Task<Role?> GetRoleByIdAsync(Guid roleId)
        {
            try
            {
                return await _context.Roles.FirstOrDefaultAsync(r => r.Id == roleId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while retrieving the role by ID: {ex.Message}");
                return null;
            }
        }

        public async Task<Role?> GetRoleByNameAsync(string roleName)
        {
            try
            {
                return await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while retrieving the role by name: {ex.Message}");
                return null;
            }
        }
    }
}