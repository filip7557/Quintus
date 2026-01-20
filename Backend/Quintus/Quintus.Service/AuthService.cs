using Microsoft.AspNetCore.Http;
using Quintus.Model;
using Quintus.Repository.Common;
using Quintus.Service.Common;
using System.Security.Claims;

namespace Quintus.Service
{
    public class AuthService : IAuthService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserRepository _userRepository;

        public AuthService(IHttpContextAccessor httpContextAccessor, IUserRepository userRepository)
        {
            _httpContextAccessor = httpContextAccessor;
            _userRepository = userRepository;
        }

        public async Task<UserDTO?> GetCurrentUserAsync()
        {
            var userId = Guid.Parse(_httpContextAccessor.HttpContext!.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user =  await _userRepository.GetUserByIdAsync(userId);
            return new UserDTO
            {
                Id = user!.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role
            };
        }
    }
}