using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Quintus.Model.Entities
{
    public class Certificate
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string ImageUrl { get; set; }
        public string? Url { get; set; }
        public DateTime? CreatedDateTime { get; set; } = DateTime.UtcNow;
    }

    public class CertificateDTO
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(200, MinimumLength = 1)]
        public required string Title { get; set; }

        [Required]
        [StringLength(1000, MinimumLength = 1)]
        public required string Description { get; set; }

        [Required]
        public required IFormFile Image { get; set; }

        public IFormFile? Pdf { get; set; }
    }

    public class CertificateUpdateDTO
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public required string Title { get; set; }
        [Required]
        [StringLength(1000, MinimumLength = 1)]
        public required string Description { get; set; }
        [StringLength(500, MinimumLength = 1)]
        public IFormFile? Pdf { get; set; }
    }

    public class CertificateResponseDTO
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string ImageUrl { get; set; }
        public string? Url { get; set; }
    }
}