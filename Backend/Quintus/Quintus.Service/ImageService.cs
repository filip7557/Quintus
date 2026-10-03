using Microsoft.AspNetCore.Http;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;
using SixLabors.ImageSharp;
using Image = Quintus.Model.Entities.Image;
using ImageSharpImage = SixLabors.ImageSharp.Image;

namespace Quintus.Service
{
    public class ImageService : IImageService
    {
        private const long MaxFileSize = 50 * 1024 * 1024;
        private const long MaxPixels = 80_000_000;

        private readonly IImageRepository _imageRepository;
        private readonly IStorageJobRepository _storageJobRepository;
        private readonly IStorageCleanupService _storageCleanupService;
        private readonly IStorageJobSignal _signal;
        private readonly IS3Service _s3Service;

        public ImageService(
            IImageRepository imageRepository,
            IStorageJobRepository storageJobRepository,
            IStorageCleanupService storageCleanupService,
            IStorageJobSignal signal,
            IS3Service s3Service)
        {
            _imageRepository = imageRepository;
            _storageJobRepository = storageJobRepository;
            _storageCleanupService = storageCleanupService;
            _signal = signal;
            _s3Service = s3Service;
        }

        public async Task<Image?> AddImageAsync(IFormFile image)
        {
            if (image == null || image.Length == 0)
                throw new ArgumentException("Datoteka je obavezna.");

            if (image.Length > MaxFileSize)
                throw new ArgumentException("Slika je prevelika (najviše 50 MB).");

            using var buffer = new MemoryStream((int)image.Length);
            await using (var upload = image.OpenReadStream())
                await upload.CopyToAsync(buffer);

            var contentType = await DetectContentTypeAsync(buffer);
            buffer.Position = 0;

            var id = Guid.NewGuid();
            var key = $"images/{id:N}";
            await _s3Service.PutObjectAsync(key, buffer, contentType, "no-cache");

            var img = new Image
            {
                Id = id,
                Url = _s3Service.GetPublicUrl(key),
            };

            if (!await _imageRepository.AddImageAsync(img))
            {
                await _s3Service.DeleteObjectAsync(key);
                return null;
            }

            await _storageJobRepository.EnqueueAsync(new StorageJob
            {
                Type = StorageJobType.OptimizeImage,
                ObjectKey = key,
                ImageId = id
            });
            _signal.Notify();

            return img;
        }

        public async Task<bool> DeleteImageAsync(Guid id)
        {
            var image = await _imageRepository.GetImageByIdAsync(id);
            if (image == null)
                return false;

            await _storageCleanupService.EnqueueDeleteAsync(image.Url);
            return true;
        }

        public async Task<bool> DeleteImageByUrlAsync(string url)
        {
            await _storageCleanupService.EnqueueDeleteAsync(url);
            return true;
        }

        public async Task<Image?> GetImageByIdAsync(Guid id)
        {
            return await _imageRepository.GetImageByIdAsync(id);
        }

        private static async Task<string> DetectContentTypeAsync(Stream stream)
        {
            ImageInfo info;
            try
            {
                stream.Position = 0;
                info = await ImageSharpImage.IdentifyAsync(stream);
            }
            catch (Exception ex) when (ex is UnknownImageFormatException or InvalidImageContentException or NotSupportedException)
            {
                throw new ArgumentException("Datoteka nije podržana slika.");
            }

            if ((long)info.Width * info.Height > MaxPixels)
                throw new ArgumentException("Slika ima prevelike dimenzije.");

            return info.Metadata.DecodedImageFormat?.DefaultMimeType
                ?? throw new ArgumentException("Datoteka nije podržana slika.");
        }
    }
}
