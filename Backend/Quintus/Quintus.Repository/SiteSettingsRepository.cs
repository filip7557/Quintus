using Microsoft.EntityFrameworkCore;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class SiteSettingsRepository : ISiteSettingsRepository
    {
        private readonly AppDbContext _context;

        public SiteSettingsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SiteSettings> GetSiteSettingsAsync()
        {
            var siteSettings = await _context.SiteSettings
                .Include(s => s.Services.OrderBy(x => x.Id))
                .FirstOrDefaultAsync();
            Console.WriteLine($"[SiteSettings] GetSiteSettingsAsync: found={(siteSettings != null ? "yes" : "no")}, count={(siteSettings?.Services?.Count ?? 0)}");

            if (siteSettings == null)
            {
                return await CreateDefaultSiteSettings();
            }

            return siteSettings;
        }

        public async Task UpdateSiteSettingsAsync(SiteSettings siteSettings)
        {
            await _context.SiteSettings.Where(s => s.Id == siteSettings.Id)
                .ForEachAsync(s =>
                {
                    s.HeroBackgroundImageUrl = siteSettings.HeroBackgroundImageUrl;
                    s.BrojObrtnice = siteSettings.BrojObrtnice;
                    s.Oib = siteSettings.Oib;
                    s.PhoneNumber = siteSettings.PhoneNumber;
                    s.Title = siteSettings.Title;
                    s.Description = siteSettings.Description;
                    s.Services = siteSettings.Services;
                    s.AboutUs = siteSettings.AboutUs;
                    s.AboutUsImageUrl = siteSettings.AboutUsImageUrl;
                    s.Address = siteSettings.Address;
                    s.ContactEmail = siteSettings.ContactEmail;
                    s.Iban = siteSettings.Iban;
                });
            await _context.SaveChangesAsync();
        }

        public Task<bool> UpdateHeroBackgroundImageUrlAsync(string value) =>
            UpdateIfChangedAsync(s => s.HeroBackgroundImageUrl, (s, v) => s.HeroBackgroundImageUrl = v, value);

        public Task<bool> UpdateTitleAsync(string value) =>
            UpdateIfChangedAsync(s => s.Title, (s, v) => s.Title = v, value);

        public Task<bool> UpdateDescriptionAsync(string value) =>
            UpdateIfChangedAsync(s => s.Description, (s, v) => s.Description = v, value);

        public Task<bool> UpdateAboutUsAsync(string value) =>
            UpdateIfChangedAsync(s => s.AboutUs, (s, v) => s.AboutUs = v, value);

        public Task<bool> UpdateAboutUsImageUrlAsync(string value) =>
            UpdateIfChangedAsync(s => s.AboutUsImageUrl, (s, v) => s.AboutUsImageUrl = v, value);

        public Task<bool> UpdateAddressAsync(string value) =>
            UpdateIfChangedAsync(s => s.Address, (s, v) => s.Address = v, value);

        public Task<bool> UpdatePhoneNumberAsync(string value) =>
            UpdateIfChangedAsync(s => s.PhoneNumber, (s, v) => s.PhoneNumber = v, value);

        public Task<bool> UpdateContactEmailAsync(string value) =>
            UpdateIfChangedAsync(s => s.ContactEmail, (s, v) => s.ContactEmail = v, value);

        public Task<bool> UpdateOibAsync(string value) =>
            UpdateIfChangedAsync(s => s.Oib, (s, v) => s.Oib = v, value);

        public Task<bool> UpdateBrojObrtniceAsync(string value) =>
            UpdateIfChangedAsync(s => s.BrojObrtnice, (s, v) => s.BrojObrtnice = v, value);

        public Task<bool> UpdateIbanAsync(string value) =>
            UpdateIfChangedAsync(s => s.Iban, (s, v) => s.Iban = v, value);

        public async Task<Guid> AddServiceAsync(Service service)
        {
            var settings = await _context.SiteSettings.FirstOrDefaultAsync();
            if (settings == null)
                settings = await CreateDefaultSiteSettings();

            service.Id = service.Id == Guid.Empty ? Guid.NewGuid() : service.Id;
            service.SiteSettingsId = settings.Id;

            await _context.Services.AddAsync(service);
            await _context.SaveChangesAsync();
            return service.Id;
        }

        public async Task<bool> UpdateServiceAsync(Service service)
        {
            var settings = await _context.SiteSettings.FirstOrDefaultAsync();
            if (settings == null)
                settings = await CreateDefaultSiteSettings();

            var existing = await _context.Services.FirstOrDefaultAsync(s => s.Id == service.Id && s.SiteSettingsId == settings.Id);
            if (existing == null)
                return false;

            var changed = false;

            if (!string.Equals(existing.Title, service.Title, StringComparison.Ordinal))
            {
                existing.Title = service.Title;
                changed = true;
            }

            if (!string.Equals(existing.Description, service.Description, StringComparison.Ordinal))
            {
                existing.Description = service.Description;
                changed = true;
            }

            if (!existing.KeyWords.SequenceEqual(service.KeyWords, StringComparer.Ordinal))
            {
                existing.KeyWords = service.KeyWords;
                changed = true;
            }

            if (!existing.ImageUrls.SequenceEqual(service.ImageUrls, StringComparer.Ordinal))
            {
                existing.ImageUrls = service.ImageUrls;
                changed = true;
            }

            if (!changed)
                return false;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteServiceAsync(Guid serviceId)
        {
            var settings = await _context.SiteSettings.FirstOrDefaultAsync();
            if (settings == null)
                return false;

            var existing = await _context.Services.FirstOrDefaultAsync(s => s.Id == serviceId && s.SiteSettingsId == settings.Id);
            if (existing == null)
                return false;

            _context.Services.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReorderServicesAsync(List<Guid> orderedServiceIds)
        {
            // Ordering is defined by Id at query time (see GetSiteSettingsAsync).
            // This method is kept for API compatibility but has no persistent effect.
            var settings = await _context.SiteSettings.FirstOrDefaultAsync();
            if (settings == null)
                return false;

            var currentIds = await _context.Services
                .Where(s => s.SiteSettingsId == settings.Id)
                .Select(s => s.Id)
                .ToListAsync();

            if (orderedServiceIds == null || orderedServiceIds.Count == 0)
                return false;

            if (orderedServiceIds.Count != currentIds.Count)
                return false;

            if (!orderedServiceIds.All(id => currentIds.Contains(id)))
                return false;

            // nothing to save
            return false;
        }

        private async Task<bool> UpdateIfChangedAsync(Func<SiteSettings, string> getter, Action<SiteSettings, string> setter, string value)
        {
            var settings = await _context.SiteSettings.FirstOrDefaultAsync();
            if (settings == null)
                settings = await CreateDefaultSiteSettings();

            value = value?.Trim() ?? string.Empty;
            var current = getter(settings) ?? string.Empty;

            if (string.Equals(current, value, StringComparison.Ordinal))
                return false;

            setter(settings, value);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<SiteSettings> CreateDefaultSiteSettings()
        {
            var siteSettings = new SiteSettings
            {
                Services = new List<Service>
                {
                    new()
                    {
                        Title = "Klimatizacija",
                        Description = "Precizan pristup svakoj instalaciji - od odabira idealnog položaja do završnog testiranja rada. Naše dugogodišnje iskustvo osigurava optimalno hlađenje uz minimalni trošak.",
                        ImageUrls = new List<string> { "https://www.instalacije-quintus.hr/_next/image?url=%2Fimages%2Fklima.webp&w=256&q=75" },
                        KeyWords = new List<string> { "Garancija na ugradnju", "Servis", "Savjetovanje" }
                    }
                }
            };

            await _context.SiteSettings.AddAsync(siteSettings);
            await _context.SaveChangesAsync();
            return siteSettings;
        }
    }
}
