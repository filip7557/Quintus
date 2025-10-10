using Quintus.Model.Entities;

namespace Quintus.Service.Common
{
    public interface IAuthService
    {
        Task<User?> GetCurrentUserAsync();
    }
}