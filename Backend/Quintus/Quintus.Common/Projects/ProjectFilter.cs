using System.ComponentModel.DataAnnotations;

namespace Quintus.Common.Projects
{
    public class ProjectFilter
    {
        [StringLength(200)]
        public string? Search { get; set; }
        [Range(1, int.MaxValue)]
        public int Page { get; set; } = 1;
        [Range(1, 100)]
        public int PageSize { get; set; } = 12;
    }
}