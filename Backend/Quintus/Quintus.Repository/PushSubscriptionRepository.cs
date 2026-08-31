using Microsoft.EntityFrameworkCore;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class PushSubscriptionRepository : IPushSubscriptionRepository
    {
        private readonly AppDbContext _context;

        public PushSubscriptionRepository(AppDbContext context)
        {
            _context = context;
        }

        public Task<PushSubscription?> GetForUserAsync(Guid userId, string endpoint)
        {
            return _context.PushSubscriptions
                .SingleOrDefaultAsync(subscription => subscription.UserId == userId && subscription.Endpoint == endpoint);
        }

        public async Task<PushSubscription> UpsertAsync(PushSubscription subscription)
        {
            var existing = await _context.PushSubscriptions
                .SingleOrDefaultAsync(item => item.Endpoint == subscription.Endpoint);

            if (existing == null)
            {
                _context.PushSubscriptions.Add(subscription);
                await _context.SaveChangesAsync();
                return subscription;
            }

            if (existing.UserId != subscription.UserId)
                throw new InvalidOperationException("Pretplata pripada drugom korisniku.");

            existing.P256dh = subscription.P256dh;
            existing.Auth = subscription.Auth;
            existing.NotifyOnAppointmentCreated = subscription.NotifyOnAppointmentCreated;
            existing.NotifyOnAppointmentUpdated = subscription.NotifyOnAppointmentUpdated;
            existing.NotifyOnAppointmentDeleted = subscription.NotifyOnAppointmentDeleted;
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> UpdatePreferencesAsync(Guid userId, string endpoint, bool notifyOnAppointmentCreated, bool notifyOnAppointmentUpdated, bool notifyOnAppointmentDeleted)
        {
            var subscription = await GetForUserAsync(userId, endpoint);
            if (subscription == null)
                return false;

            subscription.NotifyOnAppointmentCreated = notifyOnAppointmentCreated;
            subscription.NotifyOnAppointmentUpdated = notifyOnAppointmentUpdated;
            subscription.NotifyOnAppointmentDeleted = notifyOnAppointmentDeleted;
            subscription.UpdatedAt = DateTime.UtcNow;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(Guid userId, string endpoint)
        {
            var subscription = await GetForUserAsync(userId, endpoint);
            if (subscription == null)
                return false;

            _context.PushSubscriptions.Remove(subscription);
            return await _context.SaveChangesAsync() > 0;
        }

        public Task<List<PushSubscription>> GetRecipientsAsync(PushNotificationEventType eventType, Guid actorUserId)
        {
            var subscriptions = _context.PushSubscriptions
                .Where(subscription => subscription.UserId != actorUserId && !subscription.User.IsDeleted);

            subscriptions = eventType switch
            {
                PushNotificationEventType.AppointmentCreated => subscriptions.Where(subscription => subscription.NotifyOnAppointmentCreated),
                PushNotificationEventType.AppointmentUpdated => subscriptions.Where(subscription => subscription.NotifyOnAppointmentUpdated),
                PushNotificationEventType.AppointmentDeleted => subscriptions.Where(subscription => subscription.NotifyOnAppointmentDeleted),
                _ => subscriptions.Where(_ => false)
            };

            return subscriptions.ToListAsync();
        }

        public async Task DeleteByEndpointAsync(string endpoint)
        {
            var subscription = await _context.PushSubscriptions.SingleOrDefaultAsync(item => item.Endpoint == endpoint);
            if (subscription == null)
                return;

            _context.PushSubscriptions.Remove(subscription);
            await _context.SaveChangesAsync();
        }
    }
}