using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IStorageJobRepository
    {
        Task EnqueueAsync(StorageJob job);
        Task<List<StorageJob>> ClaimDueAsync(int maximumCount, DateTime now);
        Task CompleteAsync(Guid jobId);
        Task RetryAsync(Guid jobId, int attemptCount, DateTime nextAttemptAt, string error);
        Task FailAsync(Guid jobId, int attemptCount, string error);
    }
}
