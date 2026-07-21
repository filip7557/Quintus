using Microsoft.AspNetCore.Http;
using Quintus.Model.Entities;

namespace Quintus.Service.Common
{
    public interface IImageService
    {
        Task<Image?> AddImageAsync(IFormFile image);

        Task<Image?> GetImageByIdAsync(Guid id);

        Task<bool> DeleteImageAsync(Guid id);

        Task<bool> DeleteImageByUrlAsync(string url);
    }
}