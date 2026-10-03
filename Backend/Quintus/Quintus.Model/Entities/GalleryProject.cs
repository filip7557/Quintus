namespace Quintus.Model.Entities
{
    public class GalleryProject
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? ClientName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public List<GalleryProjectImage> Photos { get; set; } = new();
    }
}