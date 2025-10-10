using Microsoft.AspNetCore.Http;
using Quintus.Model.Entities;
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

        public async Task<User?> GetCurrentUserAsync()
        {
            var userId = Guid.Parse(_httpContextAccessor.HttpContext!.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            return await _userRepository.GetUserByIdAsync(userId);
        }
    }
}