using Microsoft.AspNetCore.Http;

namespace Quintus.Model
{
    public class ServiceDTO
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required List<IFormFile> Images { get; set; }
        public required List<string> KeyWords { get; set; }
    }
}
