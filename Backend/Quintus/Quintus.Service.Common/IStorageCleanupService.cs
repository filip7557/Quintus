namespace Quintus.Service.Common
{
    public interface IStorageCleanupService
    {
        Task EnqueueDeleteAsync(params IEnumerable<string?> urls);
    }
}
