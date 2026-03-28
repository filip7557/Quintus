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
using System.Globalization;
using static iText.Kernel.Font.PdfFontFactory;

namespace Quintus.Service
{
    public class PdfOfferService
    {
        private const string LogoUrl = "https://quintus.fcuric.eu/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75";

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

                    // Logo (best effort) - keep aspect ratio
                    try
                    {
                        using var client = new HttpClient();
                        var imageBytes = await client.GetByteArrayAsync(LogoUrl);
                        var imageData = ImageDataFactory.Create(imageBytes);

                        var logo = new iText.Layout.Element.Image(imageData)
                            .ScaleToFit(80, 80) // preserves aspect ratio
                            .SetHorizontalAlignment(HorizontalAlignment.LEFT);

                        document.Add(logo);
                    }
                    catch
                    {
                        // ignore
                    }

                    // Title centered
                    document.Add(new Paragraph("PONUDA")
                        .SetFontSize(24)
                        .SimulateBold()
                        .SetTextAlignment(TextAlignment.CENTER)
                        .SetMarginTop(16)
                        .SetMarginBottom(18));

                    // Company
                    document.Add(new Paragraph("Quintus - Instalaterske usluge")
                        .SetFontSize(12)
                        .SimulateBold()
                        .SetMarginBottom(10));

                    // Buyer info
                    document.Add(new Paragraph($"Kupac: {offer.BuyerName ?? ""}").SetMarginBottom(5).SetFontSize(10));
                    document.Add(new Paragraph($"Email: {offer.BuyerEmail ?? ""}").SetMarginBottom(5).SetFontSize(10));
                    if (!string.IsNullOrWhiteSpace(offer.BuyerPhone))
                        document.Add(new Paragraph($"Telefon: {offer.BuyerPhone}").SetMarginBottom(15).SetFontSize(10));

                    // Date with Croatian month
                    document.Add(new Paragraph($"Datum: {offer.CreatedAt.ToString("dd. MMMM yyyy.", hrCulture)}")
                        .SetMarginBottom(16).SetFontSize(10));

                    // Helpers for nicer cells
                    static Cell HeaderCell(string text) =>
                        new Cell()
                            .Add(new Paragraph(text).SimulateBold())
                            .SetPadding(6);

                    static Cell BodyCell(string text, TextAlignment alignment) =>
                        new Cell()
                            .Add(new Paragraph(text))
                            .SetPadding(6)
                            .SetTextAlignment(alignment);

                    // Column widths: name wider, numbers narrower
                    var table = new Table(UnitValue.CreatePercentArray(new float[] { 52, 16, 16, 16 }))
                        .SetWidth(UnitValue.CreatePercentValue(100))
                        .SetMarginTop(10)
                        .SetFontSize(10);

                    // Helper styles
                    static Cell HeaderCellModern(string text)
                    {
                        return new Cell()
                            .Add(new Paragraph(text).SimulateBold())
                            .SetPaddingTop(8)
                            .SetPaddingBottom(8)
                            .SetPaddingLeft(8)
                            .SetPaddingRight(8)
                            .SetVerticalAlignment(VerticalAlignment.MIDDLE)
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
                    table.AddHeaderCell(HeaderCellModern("Naziv"));
                    table.AddHeaderCell(HeaderCellModern("Količina"));
                    table.AddHeaderCell(HeaderCellModern("Cijena (€)"));
                    table.AddHeaderCell(HeaderCellModern("Ukupno (€)"));

                    // Body rows (zebra striping)
                    int row = 0;
                    foreach (var item in offer.Items ?? Enumerable.Empty<Item>())
                    {
                        bool shade = (row % 2 == 1);

                        table.AddCell(BodyCellModern(item.Name ?? "", TextAlignment.LEFT, shade));
                        table.AddCell(BodyCellModern(item.Quantity.ToString("F2", hrCulture), TextAlignment.RIGHT, shade));
                        table.AddCell(BodyCellModern(item.Price.ToString("F2", hrCulture), TextAlignment.RIGHT, shade));
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