namespace Quintus.Model.Entities
{
    public class Service
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required List<string> ImageUrls { get; set; }
        public required List<string> KeyWords { get; set; }
    }
}
