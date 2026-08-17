using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class UserFilter
    {
        [StringLength(200)]
        public string? Search { get; set; }

        [StringLength(32)]
        public string? Role { get; set; }

        [Range(1, int.MaxValue)]
        public int Page { get; set; } = 1;

        [Range(1, 100)]
        public int PageSize { get; set; } = 20;
    }
}