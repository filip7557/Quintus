using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Quintus.Common;
using Quintus.Service.Common;

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

            return $"https://{_options.BucketName}.s3.eu-south-mil.io.cloud.ovh.net/{Uri.EscapeDataString(objectKey)}";
        }
    }
}
