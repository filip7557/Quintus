namespace Quintus.Model.Entities
{
    public class Request
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required User RequestedBy { get; set; }
        public List<Image> Images { get; set; } = new();
        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum RequestStatus
    {
        Pending,
        InProgress,
        Completed,
        Rejected
    }
}