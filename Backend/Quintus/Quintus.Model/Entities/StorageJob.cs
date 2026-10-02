namespace Quintus.Model.Entities
{
    public enum StorageJobType
    {
        OptimizeImage = 0,
        DeleteObject = 1
    }

    public class StorageJob
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public StorageJobType Type { get; set; }
        public required string ObjectKey { get; set; }
        public Guid? ImageId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ProcessingStartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? NextAttemptAt { get; set; }
        public int AttemptCount { get; set; }
        public string? LastError { get; set; }
    }
}
