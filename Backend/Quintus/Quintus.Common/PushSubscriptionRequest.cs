using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class PushSubscriptionRequest
    {
        [Required]
        [Url]
        public string Endpoint { get; set; } = string.Empty;

        [Required]
        public string P256dh { get; set; } = string.Empty;

        [Required]
        public string Auth { get; set; } = string.Empty;

        public bool NotifyOnAppointmentCreated { get; set; }
        public bool NotifyOnAppointmentUpdated { get; set; }
        public bool NotifyOnAppointmentDeleted { get; set; }
    }
}