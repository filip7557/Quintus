using System.Globalization;
using System.Text;
using ZXing;
using ZXing.Common;
using ZXing.PDF417;

namespace Quintus.Service.Payments;

public sealed class Hub3BarcodeGenerator
{
    public string Generate(Hub3PaymentData payment)
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

        return RenderSvg(matrix);
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

    private static string RenderSvg(BitMatrix matrix)
    {
        var width = matrix.Width;
        var height = matrix.Height;

        var sb = new StringBuilder();

        sb.Append($"""
            <svg xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 {width} {height}"
                 width="{width}"
                 height="{height}">
                <rect width="100%" height="100%" fill="white"/>
            """);

        for (var y = 0; y < height; y++)
        {
            for (var x = 0; x < width; x++)
            {
                if (!matrix[x, y])
                    continue;

                sb.Append($"""<rect x="{x}" y="{y}" width="1" height="1" fill="black"/>""");
            }
        }

        sb.Append("</svg>");

        return sb.ToString();
    }
}