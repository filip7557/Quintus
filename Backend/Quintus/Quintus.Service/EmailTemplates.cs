using System.Net;

namespace Quintus.Service
{
    internal static class EmailTemplates
    {
        private const string FontStack = "font-family:'Segoe UI',Arial,Helvetica,sans-serif;";

        public static string Build(string title, string intro, string? ctaText = null, string? ctaUrl = null, string? outro = null, string? logoUrl = null)
        {
            var safeTitle = WebUtility.HtmlEncode(title);
            var safeIntro = WebUtility.HtmlEncode(intro).Replace("\n", "<br/>");
            var safeOutro = string.IsNullOrWhiteSpace(outro) ? null : WebUtility.HtmlEncode(outro).Replace("\n", "<br/>");

            var safeCtaUrl = WebUtility.HtmlEncode(ctaUrl ?? "");
            var safeCtaText = WebUtility.HtmlEncode(ctaText ?? "");

            var logoHtml = string.IsNullOrWhiteSpace(logoUrl)
                ? $"<div style=\"{FontStack}font-size:20px;font-weight:700;color:#202939;text-align:center;\">Quintus</div>"
                : $@"<img src=""{WebUtility.HtmlEncode(logoUrl)}"" width=""120"" alt=""Quintus"" style=""display:block;margin:0 auto;border:0;outline:none;text-decoration:none;height:auto;padding:10px 14px;background-color:#ffffff;border-radius:10px;"" />";

            var ctaBlock = string.Empty;
            if (!string.IsNullOrEmpty(safeCtaUrl) && !string.IsNullOrEmpty(safeCtaText))
            {
                ctaBlock = $@"
            <tr>
              <td style=""padding:4px 32px 24px 32px;text-align:center;"">
                <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" style=""border-collapse:separate;margin:0 auto;"">
                  <tr>
                    <td bgcolor=""#202939"" style=""border-radius:8px;text-align:center;"">
                      <a href=""{safeCtaUrl}"" style=""display:inline-block;padding:12px 28px;{FontStack}font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;"">{safeCtaText}</a>
                    </td>
                  </tr>
                </table>
                <div style=""margin-top:12px;{FontStack}font-size:11px;line-height:1.5;color:#999999;text-align:center;word-break:break-all;"">
                  Ako se gumb ne otvara, kopirajte poveznicu u preglednik:<br/>
                  <a href=""{safeCtaUrl}"" style=""color:#3b6fb5;text-decoration:none;"">{safeCtaUrl}</a>
                </div>
              </td>
            </tr>";
            }

            var outroBlock = safeOutro == null
                ? string.Empty
                : $@"
            <tr>
              <td style=""padding:0 32px 24px 32px;text-align:center;"">
                <div style=""{FontStack}font-size:13px;line-height:1.6;color:#777777;"">{safeOutro}</div>
              </td>
            </tr>";

            return $@"<!doctype html>
<html lang=""hr"">
  <head>
    <meta charset=""utf-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1"" />
    <meta name=""color-scheme"" content=""light only"" />
    <meta name=""supported-color-schemes"" content=""light only"" />
    <style>
      :root {{ color-scheme: light only; }}
    </style>
  </head>
  <body style=""margin:0;padding:0;background-color:#f0f2f5;"">
    <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""background-color:#f0f2f5;padding:32px 16px;"">
      <tr>
        <td align=""center"">

          <!-- Card -->
          <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""max-width:600px;margin:0 auto;border-collapse:separate;border-spacing:0;border-radius:12px;background-color:#ffffff;"">

            <!-- Logo -->
            <tr>
              <td style=""padding:28px 32px 0 32px;text-align:center;"">
                {logoHtml}
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style=""padding:16px 32px 0 32px;"">
                <div style=""border-top:1px solid #e8eaed;""></div>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style=""padding:20px 32px 8px 32px;text-align:center;"">
                <div style=""{FontStack}font-size:22px;line-height:1.3;font-weight:700;color:#202939;"">{safeTitle}</div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style=""padding:4px 32px 24px 32px;"">
                <div style=""{FontStack}font-size:14px;line-height:1.7;color:#444444;text-align:left;"">{safeIntro}</div>
              </td>
            </tr>

            {ctaBlock}
            {outroBlock}

          </table>
          <!-- End Card -->

          <!-- Footer -->
          <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""max-width:600px;margin:0 auto;"">
            <tr>
              <td style=""padding:16px 32px 0 32px;text-align:center;"">
                <div style=""{FontStack}font-size:11px;line-height:1.5;color:#999999;"">
                  &#169; {DateTime.UtcNow.Year} Quintus
                </div>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>";
        }
    }
}