using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class ResendVerificationRequest
    {
        [Required]
        [EmailAddress]
        [StringLength(254)]
        public string Email { get; set; } = string.Empty;
    }
}
