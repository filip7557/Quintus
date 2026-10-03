using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Quintus.Common;
using Quintus.Service.Common;
using System.Net;

namespace Quintus.Service
{
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3client;
        private readonly S3Options _options;

        public S3Service(IAmazonS3 s3client, IOptions<S3Options> options)
        {
            _s3client = s3client;
            _options = options.Value;
        }

        public async Task<string> UploadFileAsync(IFormFile file, CancellationToken cancellationToken = default)
        {
            if (file is null || file.Length == 0)
                throw new ArgumentException("File is empty.", nameof(file));
            
            var extension = Path.GetExtension(file.FileName);
            var objectKey = $"{Guid.NewGuid():N}{extension}";

            await using var stream = file.OpenReadStream();

            var request = new PutObjectRequest
            {
                BucketName = _options.BucketName,
                Key = objectKey,
                InputStream = stream,
                ContentType = string.IsNullOrWhiteSpace(file.ContentType)
                ? "application/octet-stream"
                : file.ContentType,

                CannedACL = S3CannedACL.PublicRead
            };

            await _s3client.PutObjectAsync(request, cancellationToken);

            return GetPublicUrl(objectKey);
        }

        public async Task PutObjectAsync(string key, Stream content, string contentType, string cacheControl, CancellationToken cancellationToken = default)
        {
            var request = new PutObjectRequest
            {
                BucketName = _options.BucketName,
                Key = key,
                InputStream = content,
                ContentType = contentType,
                CannedACL = S3CannedACL.PublicRead
            };
            request.Headers.CacheControl = cacheControl;

            await _s3client.PutObjectAsync(request, cancellationToken);
        }

        public async Task<byte[]?> GetObjectBytesAsync(string key, CancellationToken cancellationToken = default)
        {
            try
            {
                using var response = await _s3client.GetObjectAsync(_options.BucketName, key, cancellationToken);
                using var buffer = new MemoryStream();
                await response.ResponseStream.CopyToAsync(buffer, cancellationToken);
                return buffer.ToArray();
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        public async Task DeleteObjectAsync(string key, CancellationToken cancellationToken = default)
        {
            await _s3client.DeleteObjectAsync(_options.BucketName, key, cancellationToken);
        }

        public string GetPublicUrl(string key)
        {
            var escapedKey = string.Join('/', key.Split('/').Select(Uri.EscapeDataString));
            return $"https://{PublicHost}/{escapedKey}";
        }

        public bool TryGetObjectKey(string? url, out string key)
        {
            key = string.Empty;
            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
                uri.Scheme != Uri.UriSchemeHttps ||
                !string.Equals(uri.Host, PublicHost, StringComparison.OrdinalIgnoreCase))
                return false;

            key = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));
            return key.Length > 0;
        }

        public string? GetDownloadUrl(string? url, string fileName)
        {
            if (!TryGetObjectKey(url, out var key))
                return null;

            var safeFileName = Path.GetFileName(fileName);
            return _s3client.GetPreSignedURL(new GetPreSignedUrlRequest
            {
                BucketName = _options.BucketName,
                Key = key,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.AddMinutes(5),
                ResponseHeaderOverrides = new ResponseHeaderOverrides
                {
                    ContentDisposition = $"attachment; filename=\"{safeFileName}\""
                }
            });
        }

        private string PublicHost => $"{_options.BucketName}.s3.eu-south-mil.io.cloud.ovh.net";
    }
}
