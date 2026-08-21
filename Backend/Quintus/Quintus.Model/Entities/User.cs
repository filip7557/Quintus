namespace Quintus.Model.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public string? PhoneNumber { get; set; }
        public Role? Role { get; set; }
        public required string Color { get; set; } = "#91120c";
        public List<RefreshToken> RefreshTokens { get; set; } = new();

        public bool EmailVerified { get; set; }
        public List<EmailVerificationToken> EmailVerificationTokens { get; set; } = new();
        public List<PasswordResetToken> PasswordResetTokens { get; set; } = new();

        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }

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
                Role = Role,
                Id = Id,
                Color = Color
            };
        }
    }
}