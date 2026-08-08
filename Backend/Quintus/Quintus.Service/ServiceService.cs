using Quintus.Model;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class ServiceService : IServiceService
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IImageService _imageService;

        public ServiceService(IServiceRepository serviceRepository, IImageService imageService)
        {
            _serviceRepository = serviceRepository;
            _imageService = imageService;
        }

        public async Task AddServiceAsync(ServiceDTO newService)
        {
            var imageUrls = new List<string>();
            newService.Images.ForEach(async img =>
            {
                var image = await _imageService.AddImageAsync(img);
                if (image != null)
                    imageUrls.Add(image.Url);
            });
            var service = new Model.Entities.Service
            {
                Title = newService.Title,
                Description = newService.Description,
                ImageUrls = imageUrls,
                KeyWords = newService.KeyWords
            };
            await _serviceRepository.AddServiceAsync(service);
        }

        public async Task DeleteServiceAsync(Guid id)
        {
            await _serviceRepository.DeleteServiceAsync(id);
        }

        public async Task<List<Model.Entities.Service>> GetAllServicesAsync()
        {
            return await _serviceRepository.GetAllServicesAsync();
        }

        public async Task UpdateServiceAsync(Guid id, ServiceDTO service)
        {
            var existing = await _serviceRepository.GetServiceByIdAsync(id);
            if (existing == null)
                throw new KeyNotFoundException("Service not found");

            var titleChanged = !string.Equals(existing.Title, service.Title, StringComparison.Ordinal);
            var descriptionChanged = !string.Equals(existing.Description, service.Description, StringComparison.Ordinal);

            var existingKeywords = existing.KeyWords ?? new List<string>();
            var incomingKeywords = service.KeyWords ?? new List<string>();
            var keywordsChanged = !existingKeywords.SequenceEqual(incomingKeywords, StringComparer.Ordinal);

            var hasNewImages = service.Images != null && service.Images.Count > 0;

            // If nothing changed, skip.
            if (!titleChanged && !descriptionChanged && !keywordsChanged && !hasNewImages)
                return;

            var updatedImageUrls = existing.ImageUrls;
            if (hasNewImages)
            {
                updatedImageUrls = [.. existing.ImageUrls];
                if (service.Images != null)
                {
                    foreach (var img in service.Images)
                    {
                        var image = await _imageService.AddImageAsync(img);
                        if (image != null)
                            updatedImageUrls.Add(image.Url);
                    }
                }
            }

            var updated = new Model.Entities.Service
            {
                Id = existing.Id,
                Title = titleChanged ? service.Title : existing.Title,
                Description = descriptionChanged ? service.Description : existing.Description,
                KeyWords = keywordsChanged ? incomingKeywords : existingKeywords,
                ImageUrls = updatedImageUrls
            };

            await _serviceRepository.UpdateServiceAsync(updated);
        }
    }
}
