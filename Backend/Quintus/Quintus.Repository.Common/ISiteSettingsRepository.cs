using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface ISiteSettingsRepository
    {
        Task<SiteSettings> GetSiteSettingsAsync();
        Task UpdateSiteSettingsAsync(SiteSettings siteSettings);
    }
}
