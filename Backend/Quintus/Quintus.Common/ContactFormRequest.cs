using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class ContactFormRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public required string FullName { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(254)]
        public required string Email { get; set; }

        [Required]
        [StringLength(4000, MinimumLength = 10)]
        public required string Message { get; set; }
    }
}
