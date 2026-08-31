using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IPushNotificationJobRepository
    {
        Task EnqueueAsync(PushNotificationJob job);
        Task<List<PushNotificationJob>> ClaimDueAsync(int maximumCount, DateTime now);
        Task CompleteAsync(Guid jobId);
        Task RetryAsync(Guid jobId, int attemptCount, DateTime nextAttemptAt, string error);
        Task FailAsync(Guid jobId, int attemptCount, string error);
    }
}