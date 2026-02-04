using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface ISiteSettingsRepository
    {
        Task<SiteSettings> GetSiteSettingsAsync();
        Task UpdateSiteSettingsAsync(SiteSettings siteSettings);

        Task<bool> UpdateHeroBackgroundImageUrlAsync(string value);
        Task<bool> UpdateTitleAsync(string value);
        Task<bool> UpdateDescriptionAsync(string value);
        Task<bool> UpdateAboutUsAsync(string value);
        Task<bool> UpdateAboutUsImageUrlAsync(string value);
        Task<bool> UpdateAddressAsync(string value);
        Task<bool> UpdatePhoneNumberAsync(string value);
        Task<bool> UpdateContactEmailAsync(string value);
        Task<bool> UpdateOibAsync(string value);
        Task<bool> UpdateBrojObrtniceAsync(string value);
        Task<bool> UpdateIbanAsync(string value);

        Task<Guid> AddServiceAsync(Service service);
        Task<bool> UpdateServiceAsync(Service service);
        Task<bool> DeleteServiceAsync(Guid serviceId);
        Task<bool> ReorderServicesAsync(List<Guid> orderedServiceIds);
    }
}
