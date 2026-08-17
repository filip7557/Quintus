using Microsoft.AspNetCore.Http;
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
        private readonly IHttpContextAccessor _context;
        private readonly IEmailVerificationService _emailVerificationService;

        public TokenService(IConfiguration config, IUserService userService, IRoleService roleService, IRefreshTokenRepository refreshTokenRepository, IAuthService authService, IHttpContextAccessor context, IEmailVerificationService emailVerificationService)
        {
            _config = config;
            _userService = userService;
            _roleService = roleService;
            _refreshTokenRepository = refreshTokenRepository;
            _authService = authService;
            _context = context;
            _emailVerificationService = emailVerificationService;
        }

        private static bool IsPasswordValid(string? password, out string errorMessage)
        {
            errorMessage = string.Empty;

            if (string.IsNullOrWhiteSpace(password))
            {
                errorMessage = "Potrebno je unijeti lozinku.";
                return false;
            }

            if (password.Length < 6)
            {
                errorMessage = "Lozinka mora imati barem 6 znakova.";
                return false;
            }

            if (!password.Any(char.IsUpper))
            {
                errorMessage = "Lozinka mora sadržavati barem jedno veliko slovo.";
                return false;
            }

            if (!password.Any(char.IsLower))
            {
                errorMessage = "Lozinka mora sadržavati barem jedno malo slovo.";
                return false;
            }

            if (!password.Any(char.IsDigit))
            {
                errorMessage = "Lozinka mora sadržavati barem jedan broj.";
                return false;
            }

            if (!password.Any(ch => "!@#$%^&*()-_=+[]{}|;:'\",.<>?/`~".Contains(ch)))
            {
                errorMessage = "Lozinka mora sadršavati barem jedan poseban znak.";
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

            if (!user.EmailVerified)
            {
                throw new InvalidLoginInfoException("Email nije potvrđen.");
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
                Color = user.Color,
                EmailVerified = false
            };

            var saved = await _userService.RegisterUserAsync(newUser);
            if (saved)
            {
                await _emailVerificationService.SendVerificationAsync(newUser.Id, newUser.Email);
            }

            return saved;
        }

        private string GenerateToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role!.Name)
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
            var ipAddress = _context.HttpContext?.Connection.RemoteIpAddress; // Might need to adjust based on deployment scenario (e.g., behind a proxy)
            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomNumber),
                Expires = DateTime.UtcNow.AddDays(7),
                Created = DateTime.UtcNow,
                IPAddress = ipAddress,
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