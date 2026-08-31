using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IPushSubscriptionRepository
    {
        Task<PushSubscription?> GetForUserAsync(Guid userId, string endpoint);
        Task<PushSubscription> UpsertAsync(PushSubscription subscription);
        Task<bool> UpdatePreferencesAsync(Guid userId, string endpoint, bool notifyOnAppointmentCreated, bool notifyOnAppointmentUpdated, bool notifyOnAppointmentDeleted);
        Task<bool> DeleteAsync(Guid userId, string endpoint);
        Task<List<PushSubscription>> GetRecipientsAsync(PushNotificationEventType eventType, Guid actorUserId);
        Task DeleteByEndpointAsync(string endpoint);
    }
}