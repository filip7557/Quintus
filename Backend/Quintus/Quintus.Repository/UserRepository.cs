using Microsoft.EntityFrameworkCore;
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
    }
}