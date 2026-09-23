using SkiaSharp;
using System.Globalization;
using System.Text;
using ZXing;
using ZXing.Common;
using ZXing.PDF417;

namespace Quintus.Service.Payments;

public sealed class Hub3BarcodeGenerator
{
    public byte[] Generate(Hub3PaymentData payment)
    {
        var payload = BuildPayload(payment);

        var writer = new PDF417Writer();

        var hints = new Dictionary<EncodeHintType, object>
        {
            [EncodeHintType.CHARACTER_SET] = "ISO-8859-2",
            [EncodeHintType.ERROR_CORRECTION] = 2,
            [EncodeHintType.MARGIN] = 0
        };

        var matrix = writer.encode(
            payload,
            BarcodeFormat.PDF_417,
            600,
            180,
            hints);

        return RenderPng(matrix);
    }

    private static string BuildPayload(Hub3PaymentData p)
    {
        var amount = FormatAmount(p.Amount);

        var sb = new StringBuilder();

        sb.AppendLine("HRVHUB30");
        sb.AppendLine("EUR");
        sb.AppendLine(amount);

        sb.AppendLine(p.PayerName);
        sb.AppendLine(p.PayerAddress);
        sb.AppendLine(p.PayerCity);

        sb.AppendLine(p.RecipientName);
        sb.AppendLine(p.RecipientAddress);
        sb.AppendLine(p.RecipientCity);

        sb.AppendLine(NormalizeIban(p.Iban));

        sb.AppendLine(NormalizeModel(p.Model));
        sb.AppendLine(p.ReferenceNumber);

        sb.AppendLine(p.PurposeCode);
        sb.AppendLine(p.Description);

        return sb.ToString();
    }

    private static string FormatAmount(decimal amount)
    {
        if (amount < 0)
            throw new ArgumentOutOfRangeException(nameof(amount));

        // HUB-3A amount is expressed in euro cents,
        // without decimal separator.
        return ((long)Math.Round(amount * 100m))
            .ToString("000000000000000", CultureInfo.InvariantCulture);
    }

    private static string NormalizeIban(string iban)
    {
        return iban
            .Replace(" ", "")
            .Replace("-", "")
            .ToUpperInvariant();
    }

    private static string NormalizeModel(string model)
    {
        if (string.IsNullOrWhiteSpace(model))
            return "99";

        return model
            .Replace(" ", "")
            .ToUpperInvariant();
    }

    private static byte[] RenderPng(BitMatrix matrix)
    {
        var width = matrix.Width;
        var height = matrix.Height;

        using var bitmap = new SKBitmap(width, height);
        using var canvas = new SKCanvas(bitmap);

        canvas.Clear(SKColors.White);

        for (var y = 0; y < height; y++)
        {
            for (var x = 0; x < width; x++)
            {
                if (matrix[x, y])
                {
                    bitmap.SetPixel(x, y, SKColors.Black);
                }
            }
        }

        using var image = SKImage.FromBitmap(bitmap);
        using var data = image.Encode(SKEncodedImageFormat.Png, 100);

        return data.ToArray();
    }
}