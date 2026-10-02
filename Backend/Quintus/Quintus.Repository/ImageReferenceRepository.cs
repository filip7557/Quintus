using Microsoft.EntityFrameworkCore;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class ImageReferenceRepository : IImageReferenceRepository
    {
        private readonly AppDbContext _context;

        public ImageReferenceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> IsReferencedAsync(string url)
        {
            return await _context.Images.AnyAsync(i => i.Url == url)
                || await _context.Certificates.AnyAsync(c => c.ImageUrl == url || c.Url == url)
                || await _context.SiteSettings.AnyAsync(s =>
                    s.HeroBackgroundImageUrl == url ||
                    s.HeroBackgroundImageMobileUrl == url ||
                    s.AboutUsImageUrl == url)
                || await _context.Services.AnyAsync(s => s.ImageUrls.Contains(url));
        }

        public async Task<List<string>> GetReferencedUrlsWithPrefixAsync(string prefix)
        {
            var urls = new HashSet<string>(StringComparer.Ordinal);

            urls.UnionWith(await _context.Images
                .Where(i => i.Url.StartsWith(prefix))
                .Select(i => i.Url)
                .ToListAsync());

            var certificates = await _context.Certificates
                .Select(c => new { c.ImageUrl, c.Url })
                .ToListAsync();
            foreach (var certificate in certificates)
            {
                urls.Add(certificate.ImageUrl);
                if (certificate.Url != null)
                    urls.Add(certificate.Url);
            }

            var settings = await _context.SiteSettings
                .Select(s => new { s.HeroBackgroundImageUrl, s.HeroBackgroundImageMobileUrl, s.AboutUsImageUrl })
                .ToListAsync();
            foreach (var setting in settings)
            {
                urls.Add(setting.HeroBackgroundImageUrl);
                urls.Add(setting.HeroBackgroundImageMobileUrl);
                urls.Add(setting.AboutUsImageUrl);
            }

            var serviceImageUrls = await _context.Services.Select(s => s.ImageUrls).ToListAsync();
            foreach (var list in serviceImageUrls)
                urls.UnionWith(list);

            return urls.Where(url => url.StartsWith(prefix, StringComparison.Ordinal)).ToList();
        }

        public async Task ReplaceUrlAsync(string oldUrl, string newUrl)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            await _context.Images
                .Where(i => i.Url == oldUrl)
                .ExecuteUpdateAsync(s => s.SetProperty(i => i.Url, newUrl));

            await _context.Certificates
                .Where(c => c.ImageUrl == oldUrl)
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.ImageUrl, newUrl));

            await _context.Certificates
                .Where(c => c.Url == oldUrl)
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.Url, newUrl));

            await _context.SiteSettings
                .Where(s => s.HeroBackgroundImageUrl == oldUrl)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.HeroBackgroundImageUrl, newUrl));

            await _context.SiteSettings
                .Where(s => s.HeroBackgroundImageMobileUrl == oldUrl)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.HeroBackgroundImageMobileUrl, newUrl));

            await _context.SiteSettings
                .Where(s => s.AboutUsImageUrl == oldUrl)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.AboutUsImageUrl, newUrl));

            var services = await _context.Services
                .Where(s => s.ImageUrls.Contains(oldUrl))
                .ToListAsync();
            foreach (var service in services)
                service.ImageUrls = service.ImageUrls.Select(url => url == oldUrl ? newUrl : url).ToList();

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
    }
}
