using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class AppointmentOwnerUpdateRequest
    {
        [Required]
        public Guid OwnerUserId { get; set; }
    }
}