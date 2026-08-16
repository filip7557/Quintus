using Microsoft.EntityFrameworkCore;
using Quintus.Common;
using Quintus.Model;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            try
            {
                var existingUser = await _context.Users.FindAsync(userId);

                if (existingUser == null)
                {
                    return false;
                }

                _context.Users.Remove(existingUser);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception occurred while deleting user by ID: " + e.Message);
                return false;
            }
        }

        public async Task<User?> GetUserByEmailAndPasswordAsync(string email, string password)
        {
            try
            {
                return await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(r => r.Email == email && r.PasswordHash == password);
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception occurred while retrieving user by email and password: " + e.Message);
                return null;
            }
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            try
            {
                var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(r => r.Email == email);
                return user;
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception occurred while retrieving user by email: " + e.Message);
                return null;
            }
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            try
            {
                return await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(r => r.Id == userId);
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception occurred while retrieving user by ID: " + e.Message);
                return null;
            }
        }

        public async Task<User?> GetUserByRefreshTokenAsync(string refreshToken)
        {
            return await _context.Users
                .Include(u => u.RefreshTokens)
                .Include(u => u.Role)
                .SingleOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == refreshToken));
        }

        public async Task<bool> RegisterUserAsync(User user)
        {
            try
            {
                _context.Users.Add(user);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception occurred while registering user: " + e.Message);
                return false;
            }
        }

        public async Task<bool> UpdateUserAsync(Guid userId, UserDTO updatedUser)
        {
            try
            {
                var existingUser = await _context.Users.FindAsync(userId);

                if (existingUser == null)
                {
                    return false;
                }

                existingUser.FirstName = updatedUser.FirstName;
                existingUser.LastName = updatedUser.LastName;
                existingUser.Email = updatedUser.Email;
                existingUser.PhoneNumber = updatedUser.PhoneNumber;
                existingUser.Color = updatedUser.Color;
                existingUser.UpdatedAt = DateTime.UtcNow;
                _context.Users.Update(existingUser);

                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception occurred while updating user: " + e.Message);
                return false;
            }
        }

        public async Task<bool> SetEmailVerifiedAsync(Guid userId)
        {
            try
            {
                var existingUser = await _context.Users.FindAsync(userId);
                if (existingUser == null)
                    return false;

                existingUser.EmailVerified = true;
                existingUser.UpdatedAt = DateTime.UtcNow;
                _context.Users.Update(existingUser);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception occurred while setting email verified: " + e.Message);
                return false;
            }
        }

        public async Task<bool> SetPasswordHashAsync(Guid userId, string passwordHash)
        {
            try
            {
                var existingUser = await _context.Users.FindAsync(userId);
                if (existingUser == null)
                    return false;

                existingUser.PasswordHash = passwordHash;
                existingUser.UpdatedAt = DateTime.UtcNow;
                _context.Users.Update(existingUser);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception occurred while setting password hash: " + e.Message);
                return false;
            }
        }

        public async Task<bool> SetRoleAsync(Guid userId, Guid roleId)
        {
            try
            {
                var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null)
                    return false;

                var role = await _context.Roles.FirstOrDefaultAsync(r => r.Id == roleId);
                if (role == null)
                    return false;

                user.Role = role;
                user.UpdatedAt = DateTime.UtcNow;
                _context.Users.Update(user);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception occurred while setting user role: " + e.Message);
                return false;
            }
        }

        public async Task<bool> SetColorAsync(Guid userId, string color)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return false;

                user.Color = color;
                user.UpdatedAt = DateTime.UtcNow;
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception occurred while setting user color: " + e.Message);
                return false;
            }
        }

        public Task<List<User>> GetUsersByRoleNameAsync(string roleName)
        {
            return _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role != null && u.Role.Name == roleName)
                .ToListAsync();
        }

        public async Task<PagedResult<User>> GetUsersAsync(UserFilter filter)
        {
            var query = _context.Users
                .Include(u => u.Role)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var search = filter.Search.Trim().ToLower();
                query = query.Where(u =>
                    u.FirstName.ToLower().Contains(search) ||
                    u.LastName.ToLower().Contains(search) ||
                    u.Email.ToLower().Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(filter.Role))
            {
                var role = filter.Role.Trim().ToLower();
                query = query.Where(u => u.Role != null && u.Role.Name.ToLower() == role);
            }

            var totalCount = await query.CountAsync();
            var page = Math.Max(1, filter.Page);
            var pageSize = Math.Clamp(filter.PageSize, 1, 100);
            var users = await query
                .OrderBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .ThenBy(u => u.Email)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<User>
            {
                Items = users,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}