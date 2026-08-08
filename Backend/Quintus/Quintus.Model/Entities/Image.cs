namespace Quintus.Model.Entities
{
    public class Image
    {
        public Guid Id { get; set; }
        public string Url { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}