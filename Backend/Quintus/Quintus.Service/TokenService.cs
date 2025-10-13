using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Quintus.Common;
using Quintus.Common.Exceptions;
using Quintus.Model;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
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
        private readonly IAuthService _authService;
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public TokenService(IConfiguration config, IUserService userService, IRoleService roleService, IRefreshTokenRepository refreshTokenRepository, IAuthService authService)
        {
            _config = config;
            _userService = userService;
            _roleService = roleService;
            _refreshTokenRepository = refreshTokenRepository;
            _authService = authService;
        }

        private static bool IsPasswordValid(string? password, out string errorMessage)
        {
            errorMessage = string.Empty;

            if (string.IsNullOrWhiteSpace(password))
            {
                errorMessage = "Password is required.";
                return false;
            }

            if (password.Length < 6)
            {
                errorMessage = "Password must be at least 6 characters long.";
                return false;
            }

            if (!password.Any(char.IsUpper))
            {
                errorMessage = "Password must contain at least one uppercase letter.";
                return false;
            }

            if (!password.Any(char.IsLower))
            {
                errorMessage = "Password must contain at least one lowercase letter.";
                return false;
            }

            if (!password.Any(char.IsDigit))
            {
                errorMessage = "Password must contain at least one digit.";
                return false;
            }

            if (!password.Any(ch => "!@#$%^&*()-_=+[]{}|;:'\",.<>?/`~".Contains(ch)))
            {
                errorMessage = "Password must contain at least one special character.";
                return false;
            }

            return true;
        }

        public async Task<LoginResponse> LoginUserAsync(string email, string password)
        {
            var user = await _userService.GetUserByEmailAndPasswordAsync(email, HashPassword(password));

            if (user == null)
            {
                throw new InvalidLoginInfoException();
            }

            var accessToken = GenerateToken(user);
            var refreshToken = GenerateRefreshToken(user);

            await _refreshTokenRepository.SaveRefreshTokenAsync(refreshToken);

            return new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token
            };
        }

        public async Task<LoginResponse> RefreshTokenAsync(string token)
        {
            var user = await _userService.GetUserByRefreshTokenAsync(token);

            if (user == null)
            {
                throw new InvalidRefreshTokenException();
            }

            var refreshToken = user.RefreshTokens.FirstOrDefault(rt => rt.Token == token);

            if (refreshToken == null || !refreshToken.IsActive)
            {
                throw new InactiveRefreshTokenException();
            }

            await _refreshTokenRepository.RevokeRefreshTokenAsync(refreshToken);

            var newAccessToken = GenerateToken(user);
            var newRefreshToken = GenerateRefreshToken(user);

            await _refreshTokenRepository.SaveRefreshTokenAsync(newRefreshToken);

            return new LoginResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken.Token
            };
        }

        public async Task<bool> RegisterUserAsync(UserDTO user)
        {
            if (await _userService.GetUserByEmailAsync(user.Email) != null)
            {
                throw new DuplicateUserException();
            }

            if (!IsPasswordValid(user.Password, out string errorMessage))
            {
                throw new InvalidPasswordException(errorMessage);
            }

            string hashedPassword = HashPassword(user.Password!); // Password is guaranteed to be non-null here
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
                new Claim(ClaimTypes.Role, user.Role!.Name) // Role is guaranteed to be non-null here
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private RefreshToken GenerateRefreshToken(User user)
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomNumber),
                Expires = DateTime.UtcNow.AddDays(7),
                Created = DateTime.UtcNow,
                User = user
            };
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        public async Task LogoutUserAsync()
        {
            var currentUser = await _authService.GetCurrentUserAsync();
            var activeRefreshTokens = await _refreshTokenRepository.GetActiveRefreshTokensByUser(currentUser!); //Cannot be null because user is authorized.

            foreach (var token in activeRefreshTokens)
            {
                await _refreshTokenRepository.RevokeRefreshTokenAsync(token);
            }
        }
    }
}