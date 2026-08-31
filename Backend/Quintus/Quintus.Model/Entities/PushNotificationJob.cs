namespace Quintus.Model.Entities
{
    public class PushNotificationJob
    {
        public Guid Id { get; set; }
        public Guid ActorUserId { get; set; }
        public User ActorUser { get; set; } = null!;
        public Guid AppointmentId { get; set; }
        public PushNotificationEventType EventType { get; set; }
        public required string AppointmentTitle { get; set; }
        public DateTime? AppointmentStartAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ProcessingStartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? NextAttemptAt { get; set; }
        public int AttemptCount { get; set; }
        public string? LastError { get; set; }
    }
}