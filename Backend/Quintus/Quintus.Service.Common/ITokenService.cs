using Quintus.Common;
using Quintus.Model;

namespace Quintus.Service.Common
{
    public interface ITokenService
    {
        Task<bool> RegisterUserAsync(UserDTO user);

        Task<LoginResponse> LoginUserAsync(string email, string password);

        Task LogoutUserAsync();

        Task<LoginResponse> RefreshTokenAsync(string token);
    }
}