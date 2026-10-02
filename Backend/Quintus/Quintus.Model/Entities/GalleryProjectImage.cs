namespace Quintus.Model.Entities
{
    public class GalleryProjectImage
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProjectId { get; set; }
        public GalleryProject Project { get; set; } = null!;
        public Guid ImageId { get; set; }
        public Image Image { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}