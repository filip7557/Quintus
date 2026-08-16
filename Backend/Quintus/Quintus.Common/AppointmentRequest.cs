using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class AppointmentRequest : IValidatableObject
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        public DateTime StartAt { get; set; }
        public DateTime? EndAt { get; set; }

        [StringLength(2000)]
        public string? Notes { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (EndAt.HasValue && StartAt >= EndAt.Value)
                yield return new ValidationResult("Početak mora biti prije završetka.", [nameof(StartAt), nameof(EndAt)]);
        }
    }
}