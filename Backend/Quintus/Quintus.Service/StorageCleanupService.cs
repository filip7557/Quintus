using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class StorageCleanupService : IStorageCleanupService
    {
        private readonly IImageRepository _imageRepository;
        private readonly IStorageJobRepository _storageJobRepository;
        private readonly IS3Service _s3Service;
        private readonly IStorageJobSignal _signal;

        public StorageCleanupService(IImageRepository imageRepository, IStorageJobRepository storageJobRepository, IS3Service s3Service, IStorageJobSignal signal)
        {
            _imageRepository = imageRepository;
            _storageJobRepository = storageJobRepository;
            _s3Service = s3Service;
            _signal = signal;
        }

        public async Task EnqueueDeleteAsync(params IEnumerable<string?> urls)
        {
            var queued = false;
            foreach (var url in urls.Where(u => !string.IsNullOrWhiteSpace(u)).Select(u => u!.Trim()).Distinct(StringComparer.Ordinal))
            {
                await _imageRepository.DeleteImageByUrlAsync(url);

                if (!_s3Service.TryGetObjectKey(url, out var key))
                    continue;

                await _storageJobRepository.EnqueueAsync(new StorageJob
                {
                    Type = StorageJobType.DeleteObject,
                    ObjectKey = key
                });
                queued = true;
            }

            if (queued)
                _signal.Notify();
        }
    }
}
