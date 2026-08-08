using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
