import FooterSettingsEditor from "@/components/Home/editors/FooterSettingsEditor";
import Link from "next/link";

export default function SiteFooter({
  settingsId,
  oib,
  brojObrtnice,
  iban,
}) {
  const currentYear = new Date().getFullYear();
  const placeholder = "Nije postavljeno";

  const safeOib = String(oib ?? "").trim() || placeholder;
  const safeBrojObrtnice = String(brojObrtnice ?? "").trim() || placeholder;
  const safeIban = String(iban ?? "").trim() || placeholder;

  return (
    <footer className="editable-block">
      <div className="footer-container">
        <p>© {currentYear} Quintus | Sva prava pridržana.</p>
        <div className="footer-details">
          Quintus vl. Matej Peti | OIB: {safeOib}
          <br />
          Obrt je upisan u Obrtni registar Republike Hrvatske koji vodi Upravni
          odjel za gospodarstvo i fondove Europske unije Osječko-baranjske
          županije, Ispostava Našice, pod brojem obrtnice: [{safeBrojObrtnice}].
          <br />
          Bankovni račun – <strong>IBAN: {safeIban}</strong>
        </div>
        <p className="footer-policy">
          <Link href="/politika-privatnosti" prefetch={false}>
            Politika privatnosti
          </Link>
        </p>
        <p className="footer-credit">
          Web izrada i razvoj: Filip Ćurić
          <br />
          <a
            href="https://www.fcuric.eu"
            target="_blank"
            rel="noreferrer"
          >
            www.fcuric.eu
          </a>
        </p>
      </div>

      <FooterSettingsEditor
        settingsId={settingsId}
        oib={oib}
        brojObrtnice={brojObrtnice}
        iban={iban}
      />
    </footer>
  );
}
