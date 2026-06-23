using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class ResendVerificationRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
