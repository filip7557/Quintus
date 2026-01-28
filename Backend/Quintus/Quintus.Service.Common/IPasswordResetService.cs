namespace Quintus.Service.Common
{
    public interface IPasswordResetService
    {
        Task SendResetAsync(string email);

        Task<bool> ResetAsync(string token, string newPassword);
    }
}