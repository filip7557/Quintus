using Microsoft.Extensions.Logging;
using QuestPDF.Drawing;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Quintus.Model;
using Quintus.Model.Entities;
using Quintus.Service.Common;
using Quintus.Service.Payments;
using System.Diagnostics;
using System.Globalization;

namespace Quintus.Service
{
    public class PdfEstimateService
    {
        private const string FontFamily = "DejaVu Sans";

        private readonly ISiteSettingsService _siteSettingsService;
        private readonly ILogger<PdfEstimateService> _logger;

        public PdfEstimateService(ISiteSettingsService siteSettingsService, ILogger<PdfEstimateService> logger)
        {
            _siteSettingsService = siteSettingsService;
            _logger = logger;
        }

        public async Task<byte[]> GeneratePdfAsync(Estimate estimate)
        {
            if (estimate == null)
                throw new ArgumentNullException(nameof(estimate));

            var stopwatch = Stopwatch.StartNew();
            _logger.LogInformation(
                "Starting PDF rendering for estimate {EstimateId} with {ItemCount} items.",
                estimate.Id,
                estimate.Items?.Count ?? 0);

            QuestPDF.Settings.License = LicenseType.Community;

            var hrCulture = new CultureInfo("hr-HR");
            var siteSettings = await _siteSettingsService.GetSiteSettingsAsync();
            _logger.LogInformation("Loaded site settings for estimate {EstimateId}.", estimate.Id);
            var logoBytes = await TryGetLogoBytesAsync();
            _logger.LogInformation("Loaded local logo for estimate {EstimateId} PDF. Available: {LogoAvailable}, ByteCount: {LogoByteCount}.",
                estimate.Id,
                logoBytes != null,
                logoBytes?.Length ?? 0);

            EnsureFontRegistered();
            _logger.LogInformation("Registered PDF font for estimate {EstimateId}.", estimate.Id);

            var estimateTitle = estimate.Number > 0
                ? $"Predračun {estimate.Number}/{(estimate.Year > 0 ? estimate.Year : estimate.CreatedAt.Year)}"
                : "Predračun";

            var hasDiscount = (estimate.Items ?? Enumerable.Empty<Item>()).Any(i => i.DiscountPercent > 0);

            var pdfBytes = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(36);
                    page.DefaultTextStyle(x => x.FontFamily(FontFamily).FontSize(10));

                    page.Header().Element(header => ComposeHeader(header, logoBytes, siteSettings));
                    page.Content().Element(content => ComposeContent(content, estimate, hrCulture, estimateTitle, hasDiscount));
                    page.Footer().Element(ComposeFooter);
                });
            }).GeneratePdf();

            stopwatch.Stop();
            _logger.LogInformation(
                "Rendered estimate {EstimateId} PDF in {ElapsedMilliseconds} ms. ByteCount: {PdfByteCount}.",
                estimate.Id,
                stopwatch.ElapsedMilliseconds,
                pdfBytes.Length);
            return pdfBytes;
        }

        private async Task<byte[]?> TryGetLogoBytesAsync()
        {
            var logoPath = Path.Combine(AppContext.BaseDirectory, "assets", "images", "logo.png");

            try
            {
                if (File.Exists(logoPath))
                    return await File.ReadAllBytesAsync(logoPath);

                _logger.LogWarning("Offer PDF logo was not found at {LogoPath}.", logoPath);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load logo image for offer PDF from {LogoPath}", logoPath);
                return null;
            }
        }

        private void EnsureFontRegistered()
        {
            var fontPath = Path.Combine(AppContext.BaseDirectory, "assets", "fonts", "DejaVuSans.ttf");

            if (!File.Exists(fontPath))
                throw new FileNotFoundException($"Font not found: {fontPath}");

            using var fontStream = File.OpenRead(fontPath);
            FontManager.RegisterFont(fontStream);
        }

        private static void ComposeHeader(IContainer container, byte[]? logoBytes, SiteSettings siteSettings)
        {
            container.Row(row =>
            {
                row.RelativeItem().AlignLeft().Element(left =>
                {
                    if (logoBytes is { Length: > 0 })
                        left.Height(60).Image(logoBytes).FitHeight();
                });

                row.RelativeItem().AlignRight().Column(info =>
                {
                    info.Item().AlignRight().Text(siteSettings.Address ?? string.Empty).FontSize(9);
                    info.Item().PaddingTop(2).AlignRight().Text(siteSettings.PhoneNumber ?? string.Empty).FontSize(9);
                    info.Item().PaddingTop(2).AlignRight().Text(siteSettings.ContactEmail ?? string.Empty).FontSize(9);
                    info.Item().PaddingTop(2).AlignRight().Text($"OIB: {siteSettings.Oib ?? string.Empty}").FontSize(9);
                });
            });
        }

        private static void ComposeContent(IContainer container, Estimate estimate, CultureInfo hrCulture, string offerTitle, bool hasDiscount)
        {
            container.PaddingTop(36).Column(column =>
            {
                column.Item().AlignCenter().Text(offerTitle).Bold().FontSize(24);

                column.Item().PaddingTop(18).Column(buyer =>
                {
                    buyer.Item().Text($"Kupac: {estimate.BuyerName ?? string.Empty}").FontSize(10);

                    if (!string.IsNullOrWhiteSpace(estimate.BuyerEmail))
                        buyer.Item().PaddingTop(2).Text($"Email: {estimate.BuyerEmail}").FontSize(10);

                    if (!string.IsNullOrWhiteSpace(estimate.BuyerPhone))
                        buyer.Item().PaddingTop(2).Text($"Telefon: {estimate.BuyerPhone}").FontSize(10);
                });

                column.Item().PaddingTop(16).AlignRight().Text($"Datum: {estimate.CreatedAt.ToString("dd. MMMM yyyy.", hrCulture)}").FontSize(10);

                column.Item().PaddingTop(16).Element(tableContainer =>
                {
                    tableContainer.Table(table =>
                    {
                        if (hasDiscount)
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(30);
                                columns.RelativeColumn(13);
                                columns.RelativeColumn(13);
                                columns.RelativeColumn(14);
                                columns.RelativeColumn(14);
                                columns.RelativeColumn(16);
                            });
                        }
                        else
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(36);
                                columns.RelativeColumn(16);
                                columns.RelativeColumn(16);
                                columns.RelativeColumn(16);
                                columns.RelativeColumn(16);
                            });
                        }

                        table.Header(header =>
                        {
                            HeaderCell(header.Cell(), "Naziv", CellAlign.Left);
                            HeaderCell(header.Cell(), "Mj. jed.", CellAlign.Center);
                            HeaderCell(header.Cell(), "Količina", CellAlign.Right);
                            HeaderCell(header.Cell(), "Cijena (€)", CellAlign.Right);

                            if (hasDiscount)
                                HeaderCell(header.Cell(), "Popust (%)", CellAlign.Right);

                            HeaderCell(header.Cell(), "Ukupno (€)", CellAlign.Right);
                        });

                        var totalColumns = hasDiscount ? 6u : 5u;
                        var rowIndex = 0;
                        foreach (var item in estimate.Items ?? Enumerable.Empty<Item>())
                        {
                            var rowBackgroundColor = rowIndex % 2 == 1 ? "#F7F8FA" : "#FFFFFF";

                            BodyCell(table.Cell(), item.Name ?? string.Empty, CellAlign.Left, rowBackgroundColor);
                            BodyCell(table.Cell(), item.UnitOfMeasurement ?? string.Empty, CellAlign.Center, rowBackgroundColor);
                            BodyCell(table.Cell(), item.Quantity.ToString("F2", hrCulture), CellAlign.Right, rowBackgroundColor);
                            BodyCell(table.Cell(), item.Price.ToString("F2", hrCulture), CellAlign.Right, rowBackgroundColor);

                            if (hasDiscount)
                            {
                                BodyCell(
                                    table.Cell(),
                                    item.DiscountPercent > 0 ? item.DiscountPercent.ToString("F2", hrCulture) : string.Empty,
                                    CellAlign.Right,
                                    rowBackgroundColor);
                            }

                            BodyCell(table.Cell(), item.Total.ToString("F2", hrCulture), CellAlign.Right, rowBackgroundColor);

                            table.Cell()
                                .ColumnSpan(totalColumns)
                                .PaddingTop(0)
                                .LineHorizontal(0.6f)
                                .LineColor(Colors.Grey.Lighten2);

                            rowIndex++;
                        }
                    });
                });

                column.Item().LineHorizontal(0.8f).LineColor(Colors.Grey.Lighten2);

                column.Item().PaddingTop(16).AlignRight().Text($"Ukupno: {estimate.Total.ToString("F2", hrCulture)} €").Bold().FontSize(14);

                column.Item().PaddingTop(16).AlignCenter().Row(row =>
                {
                    row.RelativeItem().AlignLeft().Text($"Način plaćanja: {(estimate.IsTransactional ? "Transakcijski" : "Gotovina")}").FontSize(10);
                    if (estimate.IsTransactional)
                    {
                        row.RelativeItem().AlignRight().Width(7, Unit.Centimetre).Height(3, Unit.Centimetre).Image(PaymentBarcode(estimate));
                    }
                });

                column.Item().PaddingTop(24).Text("Hvala na vašem interesu!").Italic().FontSize(10);
            });
        }

        private static void ComposeFooter(IContainer container)
        {
            container.Column(column =>
            {
                column.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);
                column.Item().PaddingTop(8)
                    .AlignCenter()
                    .Text("Ovaj predračun nije fiskalni račun niti ponuda, već služi kao informativni dokument s podacima o iznosu i uvjetima plaćanja.\r\nDokument je računalno generiran te vrijedi bez pečata i potpisa.")
                    .FontSize(8)
                    .FontColor(Colors.Grey.Medium);

                column.Item().PaddingTop(4)
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span("Stranica ").FontSize(8).FontColor(Colors.Grey.Medium);
                        text.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Medium);
                        text.Span("/").FontSize(8).FontColor(Colors.Grey.Medium);
                        text.TotalPages().FontSize(8).FontColor(Colors.Grey.Medium);
                    });
            });
        }

        private static void HeaderCell(IContainer container, string text, CellAlign align)
        {
            var alignedContainer = ApplyHorizontalAlignment(
                container
                    .Background("#202939")
                    .PaddingVertical(8)
                    .PaddingHorizontal(8)
                    .AlignMiddle(),
                align);

            alignedContainer
                .Text(text)
                .Bold()
                .FontColor(Colors.White);
        }

        private static void BodyCell(IContainer container, string text, CellAlign align, string rowBackgroundColor)
        {
            var cell = container
                .ShowEntire()
                .Background(rowBackgroundColor)
                .PaddingTop(9)
                .PaddingBottom(9)
                .PaddingHorizontal(8);

            ApplyHorizontalAlignment(cell, align).Text(text);
        }

        private static IContainer ApplyHorizontalAlignment(IContainer container, CellAlign align)
        {
            return align switch
            {
                CellAlign.Left => container.AlignLeft(),
                CellAlign.Center => container.AlignCenter(),
                CellAlign.Right => container.AlignRight(),
                _ => container
            };
        }

        private static byte[] PaymentBarcode(Estimate estimate)
        {
            var date = DateTime.UtcNow.AddHours(2);

            var payment = new Hub3PaymentData(
                PayerName: estimate.BuyerName ?? string.Empty,
                PayerAddress: string.Empty,
                PayerCity: string.Empty,
                RecipientName: "QUINTUS, VL. MATEJ PETI",
                RecipientAddress: "Dudić 9",
                RecipientCity: "Našice",
                Iban: "HR1223400091160851975",
                Amount: estimate.Total,
                Model: "00",
                ReferenceNumber: $"{date.Year}{date.Month:D2}{date.Day:D2}-{estimate.Number}/{estimate.Year}",
                PurposeCode: "COST",
                Description: $"Predračun {estimate.Number}/{estimate.Year}"
            );

            var generator = new Hub3BarcodeGenerator();
            var barcode = generator.Generate(payment);
            return barcode;
        }

        private enum CellAlign
        {
            Left,
            Center,
            Right
        }
    }
}