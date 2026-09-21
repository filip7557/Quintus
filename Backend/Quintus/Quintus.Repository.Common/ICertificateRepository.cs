using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface ICertificateRepository
    {
        Task<IEnumerable<Certificate>> GetAllCertificatesAsync();

        Task<bool> AddCertificateAsync(Certificate certificate);

        Task<bool> DeleteCertificateAsync(Guid id);

        Task<bool> UpdateCertificateAsync(CertificateUpdateDTO certificate, Guid id);

        Task<bool> UpdateCertificateImageAsync(Guid id, string imageUrl);

        Task<bool> UpdateCertificateFileAsync(Guid id, string fileUrl);
    }
}