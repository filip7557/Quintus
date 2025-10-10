using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using dotenv.net;
using Microsoft.AspNetCore.Http;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class ImageService : IImageService
    {
        private readonly IImageRepository _imageRepository;
        private readonly ICloudinary _cloudinary;

        public ImageService(IImageRepository imageRepository, ICloudinary cloudinary)
        {
            _imageRepository = imageRepository;
            DotEnv.Load(options: new DotEnvOptions(probeForEnv: true));
            _cloudinary = cloudinary;
        }

        public async Task<Image?> AddImageAsync(IFormFile image)
        {
            var url = await UploadImage(image);
            var img = new Image
            {
                Id = Guid.NewGuid(),
                Url = url,
            };
            return await _imageRepository.AddImageAsync(img) ? img : null;
        }

        public async Task<bool> DeleteImageAsync(Guid id)
        {
            return await _imageRepository.DeleteImageAsync(id);
        }

        public async Task<Image?> GetImageByIdAsync(Guid id)
        {
            return await _imageRepository.GetImageByIdAsync(id);
        }

        private async Task<string> UploadImage(IFormFile image)
        {
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(image.FileName, image.OpenReadStream()),
                UseFilename = false,
                UniqueFilename = true,
                Folder = "quintus_images"
            };
            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            return uploadResult.SecureUrl.ToString();
        }
    }
}