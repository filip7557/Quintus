using System.ComponentModel.DataAnnotations;
using Quintus.Model.Entities;

namespace Quintus.Model
{
    public class UserDTO
    {
        public Guid? Id { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(254)]
        public string Email { get; set; } = string.Empty;

        [StringLength(128, MinimumLength = 8)]
        public string? Password { get; set; }

        [Phone]
        [StringLength(32)]
        public string? PhoneNumber { get; set; }

        public Role? Role { get; set; }
    }
}
