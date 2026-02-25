namespace Quintus.Service.Common
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlContent);
        Task SendEmailWithAttachmentAsync(string toEmail, string subject, string htmlContent, byte[] attachmentData, string attachmentFileName);
    }
}