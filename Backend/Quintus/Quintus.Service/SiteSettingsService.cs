using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class SiteSettingsService : ISiteSettingsService
    {
        private readonly ISiteSettingsRepository _siteSettingsRepository;
        private readonly IImageService _imageService;
        private readonly IStorageCleanupService _storageCleanupService;

        public SiteSettingsService(ISiteSettingsRepository siteSettingsRepository, IImageService imageService, IStorageCleanupService storageCleanupService)
        {
            _siteSettingsRepository = siteSettingsRepository;
            _imageService = imageService;
            _storageCleanupService = storageCleanupService;
        }

        public Task<SiteSettings> GetSiteSettingsAsync()
        {
            return _siteSettingsRepository.GetSiteSettingsAsync();
        }

        public Task UpdateSiteSettingsAsync(SiteSettings siteSettings)
        {
            return _siteSettingsRepository.UpdateSiteSettingsAsync(siteSettings);
        }

        public async Task UpdateHeroBackgroundImageAsync(Microsoft.AspNetCore.Http.IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Datoteka je obavezna.");

            var image = await _imageService.AddImageAsync(file);
            if (image == null)
                throw new InvalidOperationException("Prijenos slike nije uspio.");

            var previousUrl = (await _siteSettingsRepository.GetSiteSettingsAsync()).HeroBackgroundImageUrl;
            if (await _siteSettingsRepository.UpdateHeroBackgroundImageUrlAsync(image.Url))
                await _storageCleanupService.EnqueueDeleteAsync(previousUrl);
        }

        public async Task UpdateHeroBackgroundImageMobileAsync(Microsoft.AspNetCore.Http.IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Datoteka je obavezna.");

            var image = await _imageService.AddImageAsync(file);
            if (image == null)
                throw new InvalidOperationException("Prijenos slike nije uspio.");

            var previousUrl = (await _siteSettingsRepository.GetSiteSettingsAsync()).HeroBackgroundImageMobileUrl;
            if (await _siteSettingsRepository.UpdateHeroBackgroundImageMobileUrlAsync(image.Url))
                await _storageCleanupService.EnqueueDeleteAsync(previousUrl);
        }

        public async Task UpdateTitleAsync(string value)
        {
            await _siteSettingsRepository.UpdateTitleAsync(ValidateRequired(value, "Naslov"));
        }

        public async Task UpdateDescriptionAsync(string value)
        {
            await _siteSettingsRepository.UpdateDescriptionAsync(ValidateRequired(value, "Opis"));
        }

        public async Task UpdateAboutUsAsync(string value)
        {
            await _siteSettingsRepository.UpdateAboutUsAsync(ValidateRequired(value, "Tekst O nama"));
        }

        public async Task UpdateAboutUsImageAsync(Microsoft.AspNetCore.Http.IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Datoteka je obavezna.");

            var image = await _imageService.AddImageAsync(file);
            if (image == null)
                throw new InvalidOperationException("Prijenos slike nije uspio.");

            var previousUrl = (await _siteSettingsRepository.GetSiteSettingsAsync()).AboutUsImageUrl;
            if (await _siteSettingsRepository.UpdateAboutUsImageUrlAsync(image.Url))
                await _storageCleanupService.EnqueueDeleteAsync(previousUrl);
        }

        public async Task UpdateAddressAsync(string value)
        {
            await _siteSettingsRepository.UpdateAddressAsync(ValidateRequired(value, "Adresa"));
        }

        public async Task UpdatePhoneNumberAsync(string value)
        {
            await _siteSettingsRepository.UpdatePhoneNumberAsync(ValidateRequired(value, "Broj telefona"));
        }

        public async Task UpdateContactEmailAsync(string value)
        {
            await _siteSettingsRepository.UpdateContactEmailAsync(ValidateRequired(value, "Kontakt e-mail"));
        }

        public async Task UpdateOibAsync(string value)
        {
            await _siteSettingsRepository.UpdateOibAsync(ValidateRequired(value, "OIB"));
        }

        public async Task UpdateBrojObrtniceAsync(string value)
        {
            await _siteSettingsRepository.UpdateBrojObrtniceAsync(ValidateRequired(value, "Broj obrtnice"));
        }

        public async Task UpdateIbanAsync(string value)
        {
            await _siteSettingsRepository.UpdateIbanAsync(ValidateRequired(value, "IBAN"));
        }

        public async Task<Guid> AddServiceAsync(string title, string description, List<Microsoft.AspNetCore.Http.IFormFile> images, List<string> keyWords)
        {
            title = ValidateRequired(title, "Naziv usluge");
            description = ValidateRequired(description, "Opis usluge");

            var imageUrls = new List<string>();
            if (images != null)
            {
                foreach (var img in images)
                {
                    var image = await _imageService.AddImageAsync(img);
                    if (image != null)
                        imageUrls.Add(image.Url);
                }
            }

            var service = new Quintus.Model.Entities.Service
            {
                Id = Guid.NewGuid(),
                Title = title,
                Description = description,
                ImageUrls = imageUrls,
                KeyWords = keyWords ?? new List<string>()
            };

            return await _siteSettingsRepository.AddServiceAsync(service);
        }

        public async Task<bool> UpdateServiceAsync(Guid serviceId, string? title, string? description, List<Microsoft.AspNetCore.Http.IFormFile>? images, List<string>? deletedImageUrls, List<string>? keyWords)
        {
            var settings = await _siteSettingsRepository.GetSiteSettingsAsync();
            var existing = settings.Services.FirstOrDefault(s => s.Id == serviceId);
            if (existing == null)
                return false;

            var updatedTitle = title == null ? existing.Title : ValidateRequired(title, "Naziv usluge");
            var updatedDescription = description == null ? existing.Description : ValidateRequired(description, "Opis usluge");
            var updatedKeyWords = keyWords ?? existing.KeyWords;

            var updatedImageUrls = new List<string>(existing.ImageUrls);
            var changed = false;

            var urlsToDelete = deletedImageUrls?
                .Where(url => !string.IsNullOrWhiteSpace(url))
                .Select(url => url.Trim())
                .Where(url => existing.ImageUrls.Contains(url))
                .Distinct(StringComparer.Ordinal)
                .ToList();

            if (urlsToDelete != null && urlsToDelete.Count > 0)
            {
                var beforeCount = updatedImageUrls.Count;
                updatedImageUrls.RemoveAll(url => urlsToDelete.Contains(url));
                if (updatedImageUrls.Count != beforeCount)
                    changed = true;
            }

            if (images != null && images.Count > 0)
            {
                foreach (var img in images)
                {
                    var image = await _imageService.AddImageAsync(img);
                    if (image != null)
                    {
                        updatedImageUrls.Add(image.Url);
                        changed = true;
                    }
                }
            }

            if (!string.Equals(existing.Title, updatedTitle, StringComparison.Ordinal))
                changed = true;

            if (!string.Equals(existing.Description, updatedDescription, StringComparison.Ordinal))
                changed = true;

            if (!existing.KeyWords.SequenceEqual(updatedKeyWords, StringComparer.Ordinal))
                changed = true;

            if (!changed)
                return false;

            var updated = new Quintus.Model.Entities.Service
            {
                Id = existing.Id,
                Title = updatedTitle,
                Description = updatedDescription,
                KeyWords = updatedKeyWords,
                ImageUrls = updatedImageUrls
            };

            if (!await _siteSettingsRepository.UpdateServiceAsync(updated))
                return false;

            if (urlsToDelete != null)
                await _storageCleanupService.EnqueueDeleteAsync(urlsToDelete);
            return true;
        }

        public async Task<bool> DeleteServiceAsync(Guid serviceId)
        {
            var settings = await _siteSettingsRepository.GetSiteSettingsAsync();
            var imageUrls = settings.Services.FirstOrDefault(s => s.Id == serviceId)?.ImageUrls.ToList();

            if (!await _siteSettingsRepository.DeleteServiceAsync(serviceId))
                return false;

            if (imageUrls != null)
                await _storageCleanupService.EnqueueDeleteAsync(imageUrls);
            return true;
        }

        public Task<bool> ReorderServicesAsync(List<Guid> orderedServiceIds)
        {
            return _siteSettingsRepository.ReorderServicesAsync(orderedServiceIds);
        }

        private static string ValidateRequired(string value, string field)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException($"Polje '{field}' je obavezno.");

            return value.Trim();
        }
    }
}
