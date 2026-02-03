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
            var siteSettings =  await _context.SiteSettings.Include(s => s.Services).FirstOrDefaultAsync();
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
                    s.PhoneNumber  = siteSettings.PhoneNumber;
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

        private async Task<SiteSettings> CreateDefaultSiteSettings()
        {
            var siteSettings = new SiteSettings();
            await _context.SiteSettings.AddAsync(siteSettings);
            await _context.SaveChangesAsync();
            return siteSettings;
        }
    }
}
