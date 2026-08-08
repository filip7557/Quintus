using Quintus.Model;

namespace Quintus.Service.Common
{
    public interface IAuthService
    {
        Task<UserDTO?> GetCurrentUserAsync();
    }
}