using Microsoft.AspNetCore.Http;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class CertificateService : ICertificateService
    {
        private readonly IImageService _imageService;
        private readonly ICertificateRepository _certificateRepository;

        public CertificateService(IImageService imageService, ICertificateRepository certificateRepository)
        {
            _imageService = imageService;
            _certificateRepository = certificateRepository;
        }

        public async Task<bool> AddCertificateAsync(CertificateDTO certificate)
        {
            var imageUrl = await _imageService.AddImageAsync(certificate.Image);
            if (imageUrl == null) return false;
            var newCertificate = new Certificate
            {
                Title = certificate.Title,
                Description = certificate.Description,
                ImageUrl = imageUrl.Url,
                Url = certificate.Url
            };
            return await _certificateRepository.AddCertificateAsync(newCertificate);
        }

        public async Task<bool> DeleteCertificateAsync(Guid id)
        {
            return await _certificateRepository.DeleteCertificateAsync(id);
        }

        public async Task<IEnumerable<CertificateResponseDTO>> GetAllCertificatesAsync()
        {
            return await _certificateRepository.GetAllCertificatesAsync()
                .ContinueWith(task => task.Result.Select(t => new CertificateResponseDTO
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    ImageUrl = t.ImageUrl,
                    Url = t.Url
                }));
        }

        public async Task<bool> UpdateCertificateAsync(CertificateUpdateDTO certificate, Guid id)
        {
            return await _certificateRepository.UpdateCertificateAsync(certificate, id);
        }

        public async Task<bool> UpdateCertificateImageAsync(Guid id, IFormFile image)
        {
            var imageUrl = await _imageService.AddImageAsync(image);
            if (imageUrl == null) return false;
            return await _certificateRepository.UpdateCertificateImageAsync(id, imageUrl.Url);
        }
    }
}
