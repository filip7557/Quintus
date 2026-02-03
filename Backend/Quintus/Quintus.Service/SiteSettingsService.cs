using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class SiteSettingsService : ISiteSettingsService
    {
        private readonly ISiteSettingsRepository _siteSettingsRepository;

        public SiteSettingsService(ISiteSettingsRepository siteSettingsRepository)
        {
            _siteSettingsRepository = siteSettingsRepository;
        }

        public async Task<SiteSettings> GetSiteSettingsAsync()
        {
            return await _siteSettingsRepository.GetSiteSettingsAsync();
        }

        public Task UpdateSiteSettingsAsync(SiteSettings siteSettings)
        {
            throw new NotImplementedException();
        }
    }
}
