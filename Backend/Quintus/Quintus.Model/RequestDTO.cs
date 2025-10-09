using Microsoft.AspNetCore.Http;

namespace Quintus.Model
{
    public class RequestDTO
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public List<IFormFile> Images { get; set; } = new();
    }
}
