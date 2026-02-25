export default function ContactInfo({
  address,
  contactEmail,
  phoneNumber,
}) {
  const a = String(address ?? "").trim();
  const e = String(contactEmail ?? "").trim();
  const p = String(phoneNumber ?? "").trim();

  const placeholder = "Nije postavljeno";

  const formatPhoneNumber = (input) => {
    const raw = String(input ?? "").trim();
    if (!raw) return "";

    // Normalize: keep '+' if present, strip other non-digits.
    let normalized = raw.replace(/^00/, "+");
    const hasPlus = normalized.startsWith("+");
    const digitsOnly = normalized.replace(/\D/g, "");

    // Croatia-friendly formatting heuristics.
    let country = "";
    let rest = digitsOnly;

    if (hasPlus) {
      if (digitsOnly.startsWith("385")) {
        country = "385";
        rest = digitsOnly.slice(3);
      } else {
        // Unknown country code: just show the original.
        return normalized;
      }
    } else {
      if (digitsOnly.startsWith("385")) {
        country = "385";
        rest = digitsOnly.slice(3);
      } else if (digitsOnly.startsWith("0") && digitsOnly.length >= 8) {
        country = "385";
        rest = digitsOnly.slice(1);
      } else {
        rest = digitsOnly;
      }
    }

    // Drop a leading 0 after country code if present.
    if (country && rest.startsWith("0")) rest = rest.slice(1);

    const group = (r) => {
      if (r.length === 9) return `${r.slice(0, 2)} ${r.slice(2, 5)} ${r.slice(5)}`;
      if (r.length === 8) return `${r.slice(0, 1)} ${r.slice(1, 4)} ${r.slice(4)}`;
      if (r.length === 7) return `${r.slice(0, 3)} ${r.slice(3)}`;
      return r;
    };

    const formattedRest = group(rest);
    return country ? `+${country} ${formattedRest}` : formattedRest;
  };

  const telHref = (() => {
    if (!p) return "";
    const normalized = p.replace(/^00/, "+");
    const digitsOnly = normalized.replace(/\D/g, "");
    if (!digitsOnly) return "";
    if (normalized.startsWith("+")) return `+${digitsOnly}`;
    // if local starts with 0 assume HR
    if (digitsOnly.startsWith("0")) return `+385${digitsOnly.slice(1)}`;
    if (digitsOnly.startsWith("385")) return `+${digitsOnly}`;
    return digitsOnly;
  })();

  const formattedPhone = formatPhoneNumber(p);

  const mapsHref = a
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}`
    : "";
  const mailtoHref = e ? `mailto:${e}` : "";

  return (
    <div className="contact-info">
      <h3 className="contact-panel-title">Podaci</h3>

      <div className="contact-info-row">
        <div className="contact-info-label">Adresa</div>
        <div className="contact-info-value">
          {a ? (
            <a className="contact-link" href={mapsHref} target="_blank" rel="noreferrer">
              {a}
            </a>
          ) : (
            <span className="contact-placeholder">{placeholder}</span>
          )}
        </div>
      </div>

      <div className="contact-info-row">
        <div className="contact-info-label">Email</div>
        <div className="contact-info-value">
          {e ? (
            <a className="contact-link" href={mailtoHref}>
              {e}
            </a>
          ) : (
            <span className="contact-placeholder">{placeholder}</span>
          )}
        </div>
      </div>

      <div className="contact-info-row">
        <div className="contact-info-label">Telefon</div>
        <div className="contact-info-value">
          {p ? (
            <a className="contact-link" href={telHref ? `tel:${telHref}` : undefined}>
              {formattedPhone || p}
            </a>
          ) : (
            <span className="contact-placeholder">{placeholder}</span>
          )}
        </div>
      </div>
    </div>
  );
}
