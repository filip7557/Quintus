namespace Quintus.Common.Projects
{
    public class ProjectResponse
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? ClientName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int PhotoCount { get; set; }
        public string? CoverUrl { get; set; }
    }

    public class ProjectPhotoResponse
    {
        public Guid Id { get; set; }
        public required string Url { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}