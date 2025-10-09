using Microsoft.AspNetCore.Http;
using Quintus.Model.Entities;

namespace Quintus.Service.Common
{
    public interface IImageService
    {
        Task<bool> AddImageAsync(IFormFile image);

        Task<Image?> GetImageByIdAsync(Guid id);

        Task<bool> DeleteImageAsync(Guid id);
    }
}