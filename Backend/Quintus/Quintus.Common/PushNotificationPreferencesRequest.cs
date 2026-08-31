using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class PushNotificationPreferencesRequest
    {
        [Required]
        [Url]
        public string Endpoint { get; set; } = string.Empty;

        public bool NotifyOnAppointmentCreated { get; set; }
        public bool NotifyOnAppointmentUpdated { get; set; }
        public bool NotifyOnAppointmentDeleted { get; set; }
    }
}