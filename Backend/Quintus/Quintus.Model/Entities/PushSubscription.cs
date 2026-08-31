namespace Quintus.Model.Entities
{
    public class PushSubscription
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public required string Endpoint { get; set; }
        public required string P256dh { get; set; }
        public required string Auth { get; set; }
        public bool NotifyOnAppointmentCreated { get; set; }
        public bool NotifyOnAppointmentUpdated { get; set; }
        public bool NotifyOnAppointmentDeleted { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}