namespace Quintus.Repository.Common
{
    public interface IImageReferenceRepository
    {
        Task<bool> IsReferencedAsync(string url);

        Task<List<string>> GetReferencedUrlsWithPrefixAsync(string prefix);

        Task ReplaceUrlAsync(string oldUrl, string newUrl);
    }
}
