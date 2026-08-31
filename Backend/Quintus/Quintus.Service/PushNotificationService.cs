using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class PushNotificationService : IPushNotificationService
    {
        private readonly IPushNotificationJobRepository _pushNotificationJobRepository;

        public PushNotificationService(IPushNotificationJobRepository pushNotificationJobRepository)
        {
            _pushNotificationJobRepository = pushNotificationJobRepository;
        }

        public Task EnqueueAppointmentChangeAsync(PushNotificationEventType eventType, Guid actorUserId, Appointment appointment)
        {
            return _pushNotificationJobRepository.EnqueueAsync(new PushNotificationJob
            {
                Id = Guid.NewGuid(),
                ActorUserId = actorUserId,
                AppointmentId = appointment.Id,
                EventType = eventType,
                AppointmentTitle = appointment.Title,
                AppointmentStartAt = appointment.StartAt
            });
        }
    }
}