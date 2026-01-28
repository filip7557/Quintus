using Microsoft.AspNetCore.Http;

namespace Quintus.Model
{
    public class RequestDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public List<IFormFile> Images { get; set; } = new();
    }

    public class RequestResponseDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public UserDTO RequestedBy { get; set; }
        public List<string> ImageUrls { get; set; } = new();
    }
}