using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class ImageRepository : IImageRepository
    {
        private readonly AppDbContext _context;

        public ImageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddImageAsync(Image image)
        {
            try
            {
                _context.Images.Add(image);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while adding image: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> DeleteImageAsync(Guid id)
        {
            try
            {
                var image = await _context.Images.FindAsync(id);
                if (image == null)
                {
                    return false;
                }
                _context.Images.Remove(image);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while deleting image: " + ex.Message);
                return false;
            }
        }

        public async Task<Image?> GetImageByIdAsync(Guid id)
        {
            try
            {
                return await _context.Images.FindAsync(id);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving image: " + ex.Message);
                return null;
            }
        }
    }
}