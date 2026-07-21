using iText.IO.Font;
using iText.IO.Image;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Draw;
using iText.Layout;
using iText.Layout.Borders;
using iText.Layout.Element;
using iText.Layout.Properties;
using Quintus.Model;
using Quintus.Model.Entities;
using Quintus.Service.Common;
using System.Globalization;
using static iText.Kernel.Font.PdfFontFactory;

namespace Quintus.Service
{
    public class PdfOfferService
    {
        private const string LogoUrl = "https://quintus.fcuric.eu/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75";
        private readonly ISiteSettingsService _siteSettingsService;

        public PdfOfferService(ISiteSettingsService siteSettingsService)
        {
            _siteSettingsService = siteSettingsService;
        }

        public async Task<byte[]> GenerateOfferPdfAsync(Offer offer)
        {
            if (offer == null) throw new ArgumentNullException(nameof(offer));

            var hrCulture = new CultureInfo("hr-HR");

            // If SmartMode caused BC dependency pain, set false instead:
            // var props = new WriterProperties().SetSmartMode(false);
            var props = new WriterProperties().UseSmartMode();

            using (var ms = new MemoryStream())
            {
                using (var writer = new PdfWriter(ms, props))
                using (var pdf = new PdfDocument(writer))
                using (var document = new Document(pdf))
                {
                    // Margins
                    document.SetMargins(36, 36, 36, 36);

                    // Unicode font for Croatian diacritics
                    // Put the file here: <project>/assets/fonts/DejaVuSans.ttf
                    // and set it to "Copy to Output Directory"
                    var fontPath = Path.Combine(AppContext.BaseDirectory, "assets", "fonts", "DejaVuSans.ttf");
                    var font = PdfFontFactory.CreateFont(fontPath, PdfEncodings.IDENTITY_H, EmbeddingStrategy.PREFER_EMBEDDED);
                    if (!File.Exists(fontPath))
                        throw new FileNotFoundException($"Font not found: {fontPath}");
                    document.SetFont(font);

                    // Header: logo on the left, company info on the right
                    var siteSettings = await _siteSettingsService.GetSiteSettingsAsync();

                    var headerTable = new Table(UnitValue.CreatePercentArray(new float[] { 50, 50 }))
                        .SetWidth(UnitValue.CreatePercentValue(100))
                        .SetBorder(Border.NO_BORDER);

                    // Logo cell
                    var logoCell = new Cell().SetBorder(Border.NO_BORDER).SetVerticalAlignment(VerticalAlignment.MIDDLE);
                    try
                    {
                        using var client = new HttpClient();
                        var imageBytes = await client.GetByteArrayAsync(LogoUrl);
                        var imageData = ImageDataFactory.Create(imageBytes);

                        var logo = new iText.Layout.Element.Image(imageData)
                            .ScaleToFit(200, 200)
                            .SetHorizontalAlignment(HorizontalAlignment.LEFT);

                        logoCell.Add(logo);
                    }
                    catch
                    {
                        // ignore
                    }
                    headerTable.AddCell(logoCell);

                    // Company info cell
                    var infoCell = new Cell().SetBorder(Border.NO_BORDER)
                        .SetVerticalAlignment(VerticalAlignment.MIDDLE)
                        .SetTextAlignment(TextAlignment.RIGHT);
                    infoCell.Add(new Paragraph(siteSettings.Address).SetFontSize(9).SetMarginBottom(2));
                    infoCell.Add(new Paragraph(siteSettings.PhoneNumber).SetFontSize(9).SetMarginBottom(2));
                    infoCell.Add(new Paragraph(siteSettings.ContactEmail).SetFontSize(9).SetMarginBottom(2));
                    infoCell.Add(new Paragraph($"OIB: {siteSettings.Oib}").SetFontSize(9).SetMarginBottom(0));
                    headerTable.AddCell(infoCell);

                    document.Add(headerTable);

                    // Title centered
                    var offerTitle = offer.OfferNumber > 0
                        ? $"Ponuda {offer.OfferNumber}/{(offer.OfferYear > 0 ? offer.OfferYear : offer.CreatedAt.Year)}"
                        : "Ponuda";

                    document.Add(new Paragraph(offerTitle)
                        .SetFontSize(24)
                        .SimulateBold()
                        .SetTextAlignment(TextAlignment.CENTER)
                        .SetMarginTop(16)
                        .SetMarginBottom(18));

                    // Buyer info
                    document.Add(new Paragraph($"Kupac: {offer.BuyerName ?? ""}").SetMarginBottom(5).SetFontSize(10));
                    if (!string.IsNullOrWhiteSpace(offer.BuyerEmail))
                        document.Add(new Paragraph($"Email: {offer.BuyerEmail ?? ""}").SetMarginBottom(5).SetFontSize(10));
                    if (!string.IsNullOrWhiteSpace(offer.BuyerPhone))
                        document.Add(new Paragraph($"Telefon: {offer.BuyerPhone}").SetMarginBottom(15).SetFontSize(10));

                    // Date with Croatian month
                    document.Add(new Paragraph($"Datum: {offer.CreatedAt.ToString("dd. MMMM yyyy.", hrCulture)}")
                        .SetTextAlignment(TextAlignment.RIGHT)
                        .SetMarginBottom(16).SetFontSize(10));

                    // Column widths: name wider, numbers narrower
                    bool hasDiscount = (offer.Items ?? Enumerable.Empty<Item>()).Any(i => i.DiscountPercent > 0);
                    var columnWidths = hasDiscount
                        ? new float[] { 30, 13, 13, 14, 14, 16 }
                        : new float[] { 36, 16, 16, 16, 16 };
                    var table = new Table(UnitValue.CreatePercentArray(columnWidths))
                        .UseAllAvailableWidth()
                        .SetMarginTop(10)
                        .SetFontSize(10);

                    // Helper styles
                    static Cell HeaderCellModern(string text, TextAlignment align = TextAlignment.LEFT)
                    {
                        return new Cell()
                            .Add(new Paragraph(text).SimulateBold())
                            .SetPaddingTop(8)
                            .SetPaddingBottom(8)
                            .SetPaddingLeft(8)
                            .SetPaddingRight(8)
                            .SetVerticalAlignment(VerticalAlignment.MIDDLE)
                            .SetTextAlignment(align)
                            .SetBorder(Border.NO_BORDER)
                            .SetFontColor(ColorConstants.WHITE)
                            .SetBackgroundColor(new DeviceRgb(32, 41, 57)); // dark slate-ish
                    }

                    static Cell BodyCellModern(string text, TextAlignment align, bool shade)
                    {
                        var cell = new Cell()
                            .Add(new Paragraph(text))
                            .SetPaddingTop(7)
                            .SetPaddingBottom(7)
                            .SetPaddingLeft(8)
                            .SetPaddingRight(8)
                            .SetVerticalAlignment(VerticalAlignment.MIDDLE)
                            .SetTextAlignment(align)
                            .SetBorder(Border.NO_BORDER)
                            // subtle row separator
                            .SetBorderBottom(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.6f));

                        if (shade)
                            cell.SetBackgroundColor(new DeviceRgb(247, 248, 250)); // very light zebra

                        return cell;
                    }

                    // Header row
                    table.AddHeaderCell(HeaderCellModern("Naziv", TextAlignment.LEFT));
                    table.AddHeaderCell(HeaderCellModern("Mj. jed.", TextAlignment.CENTER));
                    table.AddHeaderCell(HeaderCellModern("Količina", TextAlignment.RIGHT));
                    table.AddHeaderCell(HeaderCellModern("Cijena (€)", TextAlignment.RIGHT));
                    if (hasDiscount)
                        table.AddHeaderCell(HeaderCellModern("Popust (%)", TextAlignment.RIGHT));
                    table.AddHeaderCell(HeaderCellModern("Ukupno (€)", TextAlignment.RIGHT));

                    // Body rows (zebra striping)
                    int row = 0;
                    foreach (var item in offer.Items ?? Enumerable.Empty<Item>())
                    {
                        bool shade = (row % 2 == 1);

                        table.AddCell(BodyCellModern(item.Name ?? "", TextAlignment.LEFT, shade));
                        table.AddCell(BodyCellModern(item.UnitOfMeasurement ?? "", TextAlignment.CENTER, shade));
                        table.AddCell(BodyCellModern(item.Quantity.ToString("F2", hrCulture), TextAlignment.RIGHT, shade));
                        table.AddCell(BodyCellModern(item.Price.ToString("F2", hrCulture), TextAlignment.RIGHT, shade));
                        if (hasDiscount)
                        {
                            table.AddCell(BodyCellModern(item.DiscountPercent > 0 ? item.DiscountPercent.ToString("F2", hrCulture) : "", TextAlignment.RIGHT, shade));
                        }
                        table.AddCell(BodyCellModern(item.Total.ToString("F2", hrCulture), TextAlignment.RIGHT, shade));

                        row++;
                    }

                    document.Add(table);

                    // Total
                    document.Add(new Paragraph($"Ukupno: {offer.Total.ToString("F2", hrCulture)} €")
                        .SetFontSize(14)
                        .SimulateBold()
                        .SetTextAlignment(TextAlignment.RIGHT)
                        .SetMarginTop(16));

                    if (!string.IsNullOrWhiteSpace(offer.CustomMessage))
                    {
                        var customBox = new Div()
                            .SetBorder(new SolidBorder(new DeviceRgb(32, 41, 57), 1f))
                            .SetBorderRadius(new BorderRadius(6))
                            .SetPaddingTop(10)
                            .SetPaddingBottom(10)
                            .SetPaddingLeft(12)
                            .SetPaddingRight(12)
                            .SetMarginTop(14)
                            .SetWidth(UnitValue.CreatePercentValue(100));

                        customBox.Add(new Paragraph("Napomena")
                            .SetFontSize(11)
                            .SimulateBold()
                            .SetMarginTop(0)
                            .SetMarginBottom(6));

                        if (!string.IsNullOrWhiteSpace(offer.CustomMessage))
                        {
                            customBox.Add(new Paragraph(offer.CustomMessage)
                                .SetFontSize(10)
                                .SetMarginTop(0)
                                .SetMarginBottom(0));
                        }

                        document.Add(customBox);
                    }

                    // Footer
                    document.Add(new Paragraph("Hvala na vašem interesu!")
                        .SetMarginTop(24)
                        .SetFontSize(10)
                        .SimulateItalic());

                    var separator = new LineSeparator(new SolidLine(0.5f))
                        .SetMarginTop(25)
                        .SetMarginBottom(8);

                    document.Add(separator);

                    document.Add(new Paragraph("Ova ponuda je računalno generirana te je valjana bez potpisa i pečata.")
                        .SetFontSize(8)
                        .SetFontColor(ColorConstants.GRAY)
                        .SetTextAlignment(TextAlignment.CENTER)
                        .SetMarginTop(0)
                        .SetMarginBottom(0));
                }

                return ms.ToArray();
            }
        }
    }
}