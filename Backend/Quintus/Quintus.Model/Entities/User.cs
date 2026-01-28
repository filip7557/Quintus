namespace Quintus.Model.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string? PhoneNumber { get; set; }
        public Role? Role { get; set; }
        public List<RefreshToken> RefreshTokens { get; set; } = new();

        public bool EmailVerified { get; set; }
        public List<EmailVerificationToken> EmailVerificationTokens { get; set; } = new();
        public List<PasswordResetToken> PasswordResetTokens { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public UserDTO ToDataTransferObject()
        {
            return new UserDTO
            {
                FirstName = FirstName,
                LastName = LastName,
                Email = Email,
                PhoneNumber = PhoneNumber,
                Role = Role
            };
        }
    }
}