using Microsoft.AspNetCore.Http;

namespace Quintus.Service.Common
{
    public interface IS3Service
    {
        Task<string> UploadFileAsync(IFormFile file, CancellationToken cancellationToken = default);

        Task PutObjectAsync(string key, Stream content, string contentType, string cacheControl, CancellationToken cancellationToken = default);

        Task<byte[]?> GetObjectBytesAsync(string key, CancellationToken cancellationToken = default);

        Task DeleteObjectAsync(string key, CancellationToken cancellationToken = default);

        string GetPublicUrl(string key);

        bool TryGetObjectKey(string? url, out string key);

        string? GetDownloadUrl(string? url, string fileName);
    }
}
