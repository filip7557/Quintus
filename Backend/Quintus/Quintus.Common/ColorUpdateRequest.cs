using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class ColorUpdateRequest
    {
        [Required]
        [RegularExpression("^#[0-9A-Fa-f]{6}$")]
        public string Color { get; set; } = "#91120c";
    }
}