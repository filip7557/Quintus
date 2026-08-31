namespace Quintus.Common
{
    public class PushNotificationPreferencesResponse
    {
        public string Endpoint { get; set; } = string.Empty;
        public bool NotifyOnAppointmentCreated { get; set; }
        public bool NotifyOnAppointmentUpdated { get; set; }
        public bool NotifyOnAppointmentDeleted { get; set; }
    }
}