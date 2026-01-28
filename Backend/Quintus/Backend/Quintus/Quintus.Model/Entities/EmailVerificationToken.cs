namespace Quintus.Model.Entities
{
    public class EmailVerificationToken
    {
        public required Guid Id { get; set; }

        public required Guid UserId { get; set; }
        public User? User { get; set; }

        public required string TokenHash { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? UsedAt { get; set; }

        public bool IsActive => UsedAt == null && ExpiresAt > DateTime.UtcNow;
    }
}
