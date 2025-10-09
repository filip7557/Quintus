using Quintus.Model;

namespace Quintus.Service.Common
{
    public interface ITokenService
    {
        Task<bool> RegisterUserAsync(UserDTO user);

        Task<string?> LoginUserAsync(string email, string password);
    }
}