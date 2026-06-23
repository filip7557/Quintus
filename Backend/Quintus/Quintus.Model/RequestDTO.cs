using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Quintus.Model
{
    public class RequestDTO
    {
        [Required]
        [StringLength(200, MinimumLength = 3)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(4000, MinimumLength = 10)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MinLength(1)]
        public List<IFormFile> Images { get; set; } = new();
    }

    public class RequestResponseDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public UserDTO RequestedBy { get; set; } = default!;
        public List<string> ImageUrls { get; set; } = new();
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
