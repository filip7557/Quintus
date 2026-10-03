using System.ComponentModel.DataAnnotations;

namespace Quintus.Common.Projects
{
    public class ProjectRequest
    {
        [Required, StringLength(200, MinimumLength = 1)]
        public string Name { get; set; } = "";
        [StringLength(4000)]
        public string? Description { get; set; }
        [StringLength(500)]
        public string? Address { get; set; }
        [StringLength(200)]
        public string? ClientName { get; set; }
    }
}