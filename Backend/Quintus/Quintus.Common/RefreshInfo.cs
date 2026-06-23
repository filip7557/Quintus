using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class RefreshInfo
    {
        [Required]
        public string Token { get; set; } = string.Empty;
    }
}
