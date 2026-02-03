namespace Quintus.Service.Common
{
    public interface ISiteSettingsService
    {
        Task<Model.Entities.SiteSettings> GetSiteSettingsAsync();
        Task UpdateSiteSettingsAsync(Model.Entities.SiteSettings siteSettings);
    }
}
