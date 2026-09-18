using Microsoft.EntityFrameworkCore;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class CertificateRepository : ICertificateRepository
    {
        private readonly AppDbContext _context;

        public CertificateRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddCertificateAsync(Certificate certificate)
        {
            try
            {
                await _context.Certificates.AddAsync(certificate);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error adding certificate: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> DeleteCertificateAsync(Guid id)
        {
            try
            {
                var certificate = await _context.Certificates.FindAsync(id);
                if (certificate == null)
                {
                    return false;
                }

                _context.Certificates.Remove(certificate);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error deleting certificate: " + ex.Message);
                return false;
            }
        }

        public async Task<IEnumerable<Certificate>> GetAllCertificatesAsync()
        {
            try
            {
                return await _context.Certificates.ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error retrieving certificates: " + ex.Message);
                return Enumerable.Empty<Certificate>();
            }
        }

        public async Task<bool> UpdateCertificateAsync(CertificateUpdateDTO certificate, Guid id)
        {
            try
            {
                var existingCertificate = await _context.Certificates.FindAsync(id);
                if (existingCertificate == null)
                {
                    return false;
                }

                existingCertificate.Title = certificate.Title;
                existingCertificate.Description = certificate.Description;
                existingCertificate.Url = certificate.Url;
                // Add other properties as needed

                _context.Certificates.Update(existingCertificate);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error updating certificate: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> UpdateCertificateImageAsync(Guid id, string imageUrl)
        {
            try
            {
                var existingCertificate = await _context.Certificates.FindAsync(id);
                if (existingCertificate == null)
                {
                    return false;
                }
                existingCertificate.ImageUrl = imageUrl;
                _context.Certificates.Update(existingCertificate);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error updating certificate image: " + ex.Message);
                return false;
            }
        }
    }
}