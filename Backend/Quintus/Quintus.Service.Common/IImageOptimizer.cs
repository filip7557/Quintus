namespace Quintus.Service.Common
{
    public interface IImageOptimizer
    {
        string ContentType { get; }

        Task<byte[]> OptimizeAsync(Stream input, CancellationToken cancellationToken = default);
    }
}
