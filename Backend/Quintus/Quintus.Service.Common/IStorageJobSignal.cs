namespace Quintus.Service.Common
{
    public interface IStorageJobSignal
    {
        void Notify();

        Task WaitAsync(TimeSpan timeout, CancellationToken cancellationToken);
    }
}
