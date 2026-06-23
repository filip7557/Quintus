using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class LoginInfo
    {
        [Required]
        [EmailAddress]
        public string email { get; set; } = string.Empty;

        [Required]
        [StringLength(128, MinimumLength = 8)]
        public string password { get; set; } = string.Empty;
    }
}
