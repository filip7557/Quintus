using Quintus.Model.Entities;

namespace Quintus.Service.Common
{
    public interface IPushNotificationService
    {
        Task EnqueueAppointmentChangeAsync(PushNotificationEventType eventType, Guid actorUserId, Appointment appointment);
    }
}