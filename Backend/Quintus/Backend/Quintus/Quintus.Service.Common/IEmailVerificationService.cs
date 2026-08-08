namespace Quintus.Service.Common
{
    public interface IEmailVerificationService
    {
        Task SendVerificationAsync(Guid userId, string toEmail);
        Task<bool> VerifyAsync(string token);
    }
}
