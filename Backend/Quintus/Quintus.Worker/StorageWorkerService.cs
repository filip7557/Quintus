using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;
using SixLabors.ImageSharp;

namespace Quintus.Worker
{
    public class StorageWorkerService : BackgroundService
    {
        private const int MaximumAttempts = 5;
        private const int BatchSize = 10;
        private const string OptimizedCacheControl = "public, max-age=31536000";
        private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(10);

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IStorageJobSignal _signal;
        private readonly ILogger<StorageWorkerService> _logger;

        public StorageWorkerService(IServiceScopeFactory scopeFactory, IStorageJobSignal signal, ILogger<StorageWorkerService> logger)
        {
            _scopeFactory = scopeFactory;
            _signal = signal;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    int claimed;
                    do
                    {
                        await using var scope = _scopeFactory.CreateAsyncScope();
                        var jobs = scope.ServiceProvider.GetRequiredService<IStorageJobRepository>();
                        var dueJobs = await jobs.ClaimDueAsync(BatchSize, DateTime.UtcNow);
                        claimed = dueJobs.Count;

                        foreach (var job in dueJobs)
                            await ProcessAsync(job, scope.ServiceProvider, jobs, stoppingToken);
                    }
                    while (claimed == BatchSize && !stoppingToken.IsCancellationRequested);
                }
                catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogError(ex, "Storage worker iteration failed.");
                }

                await _signal.WaitAsync(PollInterval, stoppingToken);
            }
        }

        private async Task ProcessAsync(StorageJob job, IServiceProvider services, IStorageJobRepository jobs, CancellationToken cancellationToken)
        {
            try
            {
                switch (job.Type)
                {
                    case StorageJobType.OptimizeImage:
                        await OptimizeAsync(job, services, cancellationToken);
                        break;
                    case StorageJobType.DeleteObject:
                        await DeleteAsync(job, services, cancellationToken);
                        break;
                }

                await jobs.CompleteAsync(job.Id);
            }
            catch (Exception ex) when (ex is UnknownImageFormatException or InvalidImageContentException)
            {
                _logger.LogWarning(ex, "Storage job {JobId} has an undecodable image at {Key}; keeping the original.", job.Id, job.ObjectKey);
                await jobs.FailAsync(job.Id, job.AttemptCount + 1, ex.Message);
            }
            catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "Storage job {JobId} ({Type}) failed for {Key}.", job.Id, job.Type, job.ObjectKey);
                await ScheduleRetryAsync(job, jobs, ex.Message);
            }
        }

        private static async Task OptimizeAsync(StorageJob job, IServiceProvider services, CancellationToken cancellationToken)
        {
            var images = services.GetRequiredService<IImageRepository>();
            var s3 = services.GetRequiredService<IS3Service>();
            var optimizer = services.GetRequiredService<IImageOptimizer>();

            if (job.ImageId is Guid imageId && !await images.ImageExistsAsync(imageId))
                return;

            var original = await s3.GetObjectBytesAsync(job.ObjectKey, cancellationToken);
            if (original == null)
                return;

            using var input = new MemoryStream(original);
            var optimized = await optimizer.OptimizeAsync(input, cancellationToken);

            using var output = new MemoryStream(optimized);
            await s3.PutObjectAsync(job.ObjectKey, output, optimizer.ContentType, OptimizedCacheControl, cancellationToken);

            // The image may have been deleted while it was being optimized.
            if (job.ImageId is Guid id && !await images.ImageExistsAsync(id))
                await s3.DeleteObjectAsync(job.ObjectKey, cancellationToken);
        }

        private async Task DeleteAsync(StorageJob job, IServiceProvider services, CancellationToken cancellationToken)
        {
            var references = services.GetRequiredService<IImageReferenceRepository>();
            var s3 = services.GetRequiredService<IS3Service>();

            if (await references.IsReferencedAsync(s3.GetPublicUrl(job.ObjectKey)))
            {
                _logger.LogInformation("Skipping delete of {Key} because it is still referenced.", job.ObjectKey);
                return;
            }

            await s3.DeleteObjectAsync(job.ObjectKey, cancellationToken);
        }

        private static async Task ScheduleRetryAsync(StorageJob job, IStorageJobRepository jobs, string error)
        {
            var attemptCount = job.AttemptCount + 1;
            if (attemptCount >= MaximumAttempts)
            {
                await jobs.FailAsync(job.Id, attemptCount, error);
                return;
            }

            var delay = TimeSpan.FromMinutes(Math.Pow(2, attemptCount - 1));
            await jobs.RetryAsync(job.Id, attemptCount, DateTime.UtcNow.Add(delay), error);
        }
    }
}
