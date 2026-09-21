using Microsoft.AspNetCore.Http;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class CertificateService : ICertificateService
    {
        private readonly IImageService _imageService;
        private readonly IS3Service _s3Service;
        private readonly ICertificateRepository _certificateRepository;

        public CertificateService(IImageService imageService, IS3Service s3Service, ICertificateRepository certificateRepository)
        {
            _imageService = imageService;
            _s3Service = s3Service;
            _certificateRepository = certificateRepository;
        }

        public async Task<bool> AddCertificateAsync(CertificateDTO certificate)
        {
            var image = await _imageService.AddImageAsync(certificate.Image);
            string? pdfUrl = null;
            if (certificate.Pdf != null)
            {
                pdfUrl = await _s3Service.UploadFileAsync(certificate.Pdf);
                if (pdfUrl == null || pdfUrl == "") return false;
            }
            if (image == null) return false;
            var newCertificate = new Certificate
            {
                Title = certificate.Title,
                Description = certificate.Description,
                ImageUrl = image.Url,
                Url = pdfUrl
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

        public async Task<bool> UpdateCertificateFileAsync(Guid id, IFormFile file)
        {
            var fileUrl = await _s3Service.UploadFileAsync(file);
            if (fileUrl == null || fileUrl == "") return false;
            return await _certificateRepository.UpdateCertificateFileAsync(id, fileUrl);
        }
    }
}
