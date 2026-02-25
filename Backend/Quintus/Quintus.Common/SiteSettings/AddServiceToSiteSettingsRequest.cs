using Microsoft.AspNetCore.Http;

namespace Quintus.Common.SiteSettings
{
    public class AddServiceToSiteSettingsRequest
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public List<IFormFile> Images { get; set; } = new();
        public List<string> KeyWords { get; set; } = new();
    }
}
