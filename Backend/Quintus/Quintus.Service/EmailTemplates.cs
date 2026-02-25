using System.Net;

namespace Quintus.Service
{
    internal static class EmailTemplates
    {
        public static string Build(string title, string intro, string? ctaText = null, string? ctaUrl = null, string? outro = null, string? logoUrl = null)
        {
            var safeTitle = WebUtility.HtmlEncode(title);
            var safeIntro = WebUtility.HtmlEncode(intro).Replace("\n", "<br/>");
            var safeOutro = string.IsNullOrWhiteSpace(outro) ? null : WebUtility.HtmlEncode(outro).Replace("\n", "<br/>");

            var safeCtaUrl = WebUtility.HtmlEncode(ctaUrl ?? "");
            var safeCtaText = WebUtility.HtmlEncode(ctaText ?? "");

            var outroBlock = safeOutro == null
                ? string.Empty
                : $"<tr><td style=\"padding:0 22px 22px 22px;text-align:center;\"><div style=\"font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:rgba(234,242,255,0.72);\">{safeOutro}</div></td></tr>";

            var logoBlock = string.IsNullOrWhiteSpace(logoUrl)
                ? "<div style=\"font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#eaf2ff;text-align:center;\">Quintus</div>"
                : $@"<table role=""presentation"" cellspacing=""0"" cellpadding=""0"" style=""margin:0 auto;border-collapse:separate;"">
                      <tr>
                        <td bgcolor=""#ffffff"" style=""background:#ffffff !important;border:1px solid rgba(0,0,0,0.08);border-radius:12px;padding:8px 12px;"">
                          <img src=""{WebUtility.HtmlEncode(logoUrl)}"" width=""120"" alt=""Quintus"" style=""display:block;border:0;outline:none;text-decoration:none;height:auto;"" />
                        </td>
                      </tr>
                    </table>";

            // Email-safe HTML: table layout + inline styles
            if (safeCtaUrl != "" && safeCtaText == "")
                return $@"<!doctype html>
<html>
  <head>
    <meta charset=""utf-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1"" />
  </head>
  <body style=""margin:0;padding:0;background-color:#2e3336;"">
    <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""background-color:#2e3336;padding:32px 16px;"">
      <tr>
        <td align=""center"" style=""text-align:center;"">
          <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""max-width:620px;margin:0 auto;border-collapse:separate;border-spacing:0;border:1px solid rgba(255,255,255,0.16);border-radius:14px;background:linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%);"">
            <tr>
              <td style=""padding:22px 22px 12px 22px;text-align:center;"">
                {logoBlock}
                <div style=""margin-top:12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.25;font-weight:700;color:#eaf2ff;text-align:center;"">{safeTitle}</div>
              </td>
            </tr>
            <tr>
              <td style=""padding:0 22px 18px 22px;text-align:center;"">
                <div style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:rgba(234,242,255,0.84);text-align:center;"">{safeIntro}</div>
              </td>
            </tr>
            <tr>
              <td style=""padding:0 22px 22px 22px;text-align:center;"">
                <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" style=""border-collapse:separate;margin:0 auto;"">
                  <tr>
                    <td bgcolor=""#6ea8fe"" style=""border-radius:10px;"">
                      <a href=""{safeCtaUrl}"" style=""display:inline-block;padding:12px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;background:linear-gradient(90deg,#6ea8fe,#8fc6ff);"">{safeCtaText}</a>
                    </td>
                  </tr>
                </table>
                <div style=""margin-top:14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:rgba(234,242,255,0.68);text-align:center;word-break:break-all;"">{(safeCtaUrl == "" ? "" : "Ako se gumb ne otvara, kopirajte poveznicu u preglednik:")}<br/>
                  <a href=""{safeCtaUrl}"" style=""color:#8fc6ff;text-decoration:none;"">{safeCtaUrl}</a>
                </div>
              </td>
            </tr>
            {outroBlock}
            <tr>
              <td style=""padding:16px 22px 20px 22px;border-top:1px solid rgba(255,255,255,0.10);text-align:center;"">
                <div style=""font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:rgba(234,242,255,0.55);text-align:center;"">
                  © {DateTime.UtcNow.Year} Quintus
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>";
            else
                return $@"<!doctype html>
<html>
  <head>
    <meta charset=""utf-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1"" />
  </head>
  <body style=""margin:0;padding:0;background-color:#2e3336;"">
    <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""background-color:#2e3336;padding:32px 16px;"">
      <tr>
        <td align=""center"" style=""text-align:center;"">
          <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""max-width:620px;margin:0 auto;border-collapse:separate;border-spacing:0;border:1px solid rgba(255,255,255,0.16);border-radius:14px;background:linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%);"">
            <tr>
              <td style=""padding:22px 22px 12px 22px;text-align:center;"">
                {logoBlock}
                <div style=""margin-top:12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.25;font-weight:700;color:#eaf2ff;text-align:center;"">{safeTitle}</div>
              </td>
            </tr>
            <tr>
              <td style=""padding:0 22px 18px 22px;text-align:center;"">
                <div style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:rgba(234,242,255,0.84);text-align:center;"">{safeIntro}</div>
              </td>
            </tr>
            <tr>
              <td style=""padding:0 22px 22px 22px;text-align:center;"">
                <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" style=""border-collapse:separate;margin:0 auto;"">
                  <tr>
                  </tr>
                </table>
              </td>
            </tr>
            {outroBlock}
            <tr>
              <td style=""padding:16px 22px 20px 22px;border-top:1px solid rgba(255,255,255,0.10);text-align:center;"">
                <div style=""font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:rgba(234,242,255,0.55);text-align:center;"">
                  © {DateTime.UtcNow.Year} Quintus
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