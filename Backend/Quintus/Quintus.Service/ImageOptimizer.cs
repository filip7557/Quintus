using Quintus.Service.Common;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace Quintus.Service
{
    public class ImageOptimizer : IImageOptimizer
    {
        private const int MaxDimension = 2560;
        private static readonly WebpEncoder Encoder = new()
        {
            FileFormat = WebpFileFormatType.Lossy,
            Quality = 80
        };

        public string ContentType => "image/webp";

        public async Task<byte[]> OptimizeAsync(Stream input, CancellationToken cancellationToken = default)
        {
            using var image = await Image.LoadAsync(input, cancellationToken);

            image.Mutate(x =>
            {
                x.AutoOrient();
                x.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(MaxDimension, MaxDimension),
                    Sampler = KnownResamplers.Lanczos3
                });
            });

            // Drops camera metadata such as GPS location.
            image.Metadata.ExifProfile = null;
            image.Metadata.IptcProfile = null;
            image.Metadata.XmpProfile = null;

            using var output = new MemoryStream();
            await image.SaveAsWebpAsync(output, Encoder, cancellationToken);
            return output.ToArray();
        }
    }
}
