using Quintus.Model.Entities;

namespace Quintus.Model
{
    public class UserDTO
    {
        public Guid? Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string? Password { get; set; }
        public string? PhoneNumber { get; set; }
        public Role? Role { get; set; }
    }
}