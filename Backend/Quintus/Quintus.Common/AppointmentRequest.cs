using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class AppointmentRequest : IValidatableObject
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        public DateTime? StartAt { get; set; }
        public DateTime? EndAt { get; set; }
        public DateTime? RepeatUntil { get; set; }

        [StringLength(2000)]
        public string? Notes { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (EndAt.HasValue && StartAt.HasValue && StartAt.Value >= EndAt.Value)
                yield return new ValidationResult("Početak mora biti prije završetka.", [nameof(StartAt), nameof(EndAt)]);

            if (RepeatUntil.HasValue && !StartAt.HasValue)
                yield return new ValidationResult("Ponavljanje zahtijeva postavljen početak.", [nameof(StartAt), nameof(RepeatUntil)]);

            if (RepeatUntil.HasValue && StartAt.HasValue && RepeatUntil.Value.Date < StartAt.Value.Date)
                yield return new ValidationResult("Datum ponavljanja mora biti nakon početka.", [nameof(StartAt), nameof(RepeatUntil)]);
        }
    }
}