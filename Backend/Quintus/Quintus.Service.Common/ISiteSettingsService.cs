namespace Quintus.Service.Common
{
    public interface ISiteSettingsService
    {
        Task<Model.Entities.SiteSettings> GetSiteSettingsAsync();
        Task UpdateSiteSettingsAsync(Model.Entities.SiteSettings siteSettings);

        Task UpdateHeroBackgroundImageAsync(Microsoft.AspNetCore.Http.IFormFile file);
        Task UpdateTitleAsync(string value);
        Task UpdateDescriptionAsync(string value);
        Task UpdateAboutUsAsync(string value);
        Task UpdateAboutUsImageAsync(Microsoft.AspNetCore.Http.IFormFile file);
        Task UpdateAddressAsync(string value);
        Task UpdatePhoneNumberAsync(string value);
        Task UpdateContactEmailAsync(string value);
        Task UpdateOibAsync(string value);
        Task UpdateBrojObrtniceAsync(string value);
        Task UpdateIbanAsync(string value);

        Task<Guid> AddServiceAsync(string title, string description, List<Microsoft.AspNetCore.Http.IFormFile> images, List<string> keyWords);
        Task<bool> UpdateServiceAsync(Guid serviceId, string? title, string? description, List<Microsoft.AspNetCore.Http.IFormFile>? images, List<string>? keyWords);
        Task<bool> DeleteServiceAsync(Guid serviceId);
        Task<bool> ReorderServicesAsync(List<Guid> orderedServiceIds);
    }
}
