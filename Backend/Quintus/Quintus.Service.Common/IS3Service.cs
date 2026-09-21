using Microsoft.AspNetCore.Http;

namespace Quintus.Service.Common
{
    public interface IS3Service
    {
        Task<string> UploadFileAsync(IFormFile file, CancellationToken cancellationToken = default);
    }
}
