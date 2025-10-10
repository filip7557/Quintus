using Microsoft.AspNetCore.Http;

namespace Quintus.Model
{
    public class RequestDTO
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public List<IFormFile> Images { get; set; } = new();
    }

    public class RequestResponseDTO
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required UserDTO RequestedBy { get; set; }
        public List<string> ImageUrls { get; set; } = new();
    }
}