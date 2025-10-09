using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Quintus.Model;
using Quintus.Model.Entities;
using Quintus.Service.Common;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Quintus.Service
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;
        private readonly IUserService _userService;
        private readonly IRoleService _roleService;

        public TokenService(IConfiguration config, IUserService userService, IRoleService roleService)
        {
            _config = config;
            _userService = userService;
            _roleService = roleService;
        }

        public async Task<string?> LoginUserAsync(string email, string password)
        {
            var user = await _userService.GetUserByEmailAndPasswordAsync(email, HashPassword(password));

            if (user == null)
            {
                return null;
            }

            return GenerateToken(user);
        }

        public async Task<bool> RegisterUserAsync(UserDTO user)
        {
            if (await _userService.GetUserByEmailAsync(user.Email) != null)
            {
                return false;
            }

            if (string.IsNullOrWhiteSpace(user.Password) || user.Password.Length < 4)
            {
                return false;
            }

            string hashedPassword = HashPassword(user.Password);
            var newUser = new User
            {
                Id = Guid.NewGuid(),
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PasswordHash = hashedPassword,
                PhoneNumber = user.PhoneNumber,
                Role = await _roleService.GetDefaultRoleAsync(),
            };

            return await _userService.RegisterUserAsync(newUser);
        }

        private string GenerateToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}