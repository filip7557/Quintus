using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IImageRepository
    {
        Task<bool> AddImageAsync(Image image);

        Task<Image?> GetImageByIdAsync(Guid id);

        Task<bool> DeleteImageAsync(Guid id);

        Task<bool> DeleteImageByUrlAsync(string url);
    }
}