using Microsoft.AspNetCore.Http;

namespace Quintus.Common.SiteSettings
{
    public class UpdateServiceInSiteSettingsRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public List<IFormFile>? Images { get; set; }
        public List<string>? KeyWords { get; set; }
    }
}
