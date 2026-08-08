using System.Globalization;
using System.Text;
using Quintus.Model.Entities;

namespace Quintus.Service.Common
{
    public static class OfferFileNameFormatter
    {
        public static string GetFileName(Offer offer)
        {
            ArgumentNullException.ThrowIfNull(offer);

            var buyerName = NormalizeFileNamePart(offer.BuyerName);
            var suffix = offer.OfferNumber > 0 && offer.OfferYear > 0
                ? $"{offer.OfferNumber}-{offer.OfferYear}"
                : offer.Id.ToString("N", CultureInfo.InvariantCulture);

            return string.IsNullOrWhiteSpace(buyerName)
                ? $"Ponuda_{suffix}.pdf"
                : $"Ponuda_{buyerName}_{suffix}.pdf";
        }

        private static string NormalizeFileNamePart(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return string.Empty;

            var normalized = value.Trim().Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder(normalized.Length);

            foreach (var ch in normalized)
            {
                var category = CharUnicodeInfo.GetUnicodeCategory(ch);
                if (category == UnicodeCategory.NonSpacingMark)
                    continue;

                if (char.IsLetterOrDigit(ch))
                {
                    builder.Append(ch);
                }
                else if (char.IsWhiteSpace(ch) || ch == '-' || ch == '_')
                {
                    builder.Append('_');
                }
            }

            var cleaned = builder.ToString();
            while (cleaned.Contains("__", StringComparison.Ordinal))
                cleaned = cleaned.Replace("__", "_", StringComparison.Ordinal);

            return cleaned.Trim('_');
        }
    }
}
