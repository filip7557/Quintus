using Quintus.Model.Entities;

namespace Quintus.Model
{
    public class UserDTO
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public string? Password { get; set; }
        public string? PhoneNumber { get; set; }
        public Role? Role { get; set; }
    }
}