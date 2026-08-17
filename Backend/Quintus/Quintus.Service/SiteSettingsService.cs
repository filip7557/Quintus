using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class SiteSettingsService : ISiteSettingsService
    {
        private readonly ISiteSettingsRepository _siteSettingsRepository;
        private readonly IImageService _imageService;

        public SiteSettingsService(ISiteSettingsRepository siteSettingsRepository, IImageService imageService)
        {
            _siteSettingsRepository = siteSettingsRepository;
            _imageService = imageService;
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

            await _siteSettingsRepository.UpdateHeroBackgroundImageUrlAsync(image.Url);
        }

        public async Task UpdateHeroBackgroundImageMobileAsync(Microsoft.AspNetCore.Http.IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Datoteka je obavezna.");

            var image = await _imageService.AddImageAsync(file);
            if (image == null)
                throw new InvalidOperationException("Prijenos slike nije uspio.");

            await _siteSettingsRepository.UpdateHeroBackgroundImageMobileUrlAsync(image.Url);
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

            await _siteSettingsRepository.UpdateAboutUsImageUrlAsync(image.Url);
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
                .Distinct(StringComparer.Ordinal)
                .ToList();

            if (urlsToDelete != null && urlsToDelete.Count > 0)
            {
                var beforeCount = updatedImageUrls.Count;
                updatedImageUrls.RemoveAll(url => urlsToDelete.Contains(url));
                if (updatedImageUrls.Count != beforeCount)
                    changed = true;

                foreach (var url in urlsToDelete)
                    await _imageService.DeleteImageByUrlAsync(url);
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

            return await _siteSettingsRepository.UpdateServiceAsync(updated);
        }

        public Task<bool> DeleteServiceAsync(Guid serviceId)
        {
            return _siteSettingsRepository.DeleteServiceAsync(serviceId);
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
