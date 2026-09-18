using Microsoft.AspNetCore.Http;
using Quintus.Model.Entities;

namespace Quintus.Service.Common
{
    public interface ICertificateService
    {
        Task<IEnumerable<CertificateResponseDTO>> GetAllCertificatesAsync();

        Task<bool> AddCertificateAsync(CertificateDTO certificate);

        Task<bool> UpdateCertificateAsync(CertificateUpdateDTO certificate, Guid id);

        Task<bool> UpdateCertificateImageAsync(Guid id, IFormFile image);

        Task<bool> DeleteCertificateAsync(Guid id);
    }
}