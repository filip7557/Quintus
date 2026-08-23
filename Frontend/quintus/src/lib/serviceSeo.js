// Per-service SEO copy overrides, keyed by slug, for stronger local-search targeting.
// Any service without an entry here falls back to a generic title/description built from its data.
const SERVICE_SEO_OVERRIDES = {
  klimatizacija: {
    title: "Ovlašteno montiranje klima uređaja - Našice | Quintus",
    description:
      "Ovlašteni monteri klima uređaja u Našicama i Slavoniji. Montaža, servis i redovito održavanje klima uređaja za domove i poslovne prostore.",
    extraKeywords: [
      "ovlašteno montiranje klima uređaja",
      "klima uređaji Našice",
      "servis klime Slavonija",
      "montaža klima uređaja Našice",
      "ovlašteni monteri klima uređaja Slavonija",
      "redovito održavanje klima uređaja Našice",
      "servis i popravak klima uređaja Slavonija",
      "instalacija klima uređaja Našice",
      "ovlašteni serviser klima uređaja Slavonija",
      "montaža i servis klima uređaja Našice",
      "posjedujemo sve potrebne certifikate za rad s klima uređajima",
      "certificirani monteri klima uređaja",
      "certificirani monteri klima uređaja Našice",
      "ovlašteni serviseri klima uređaja",
      "certificirani serviseri klima uređaja",
      "certificirani serviseri klima uređaja Našice",
    ],
  },
  grijanje: {
    title: "Instalacije i ugradnja grijanja - Našice | Quintus",
    description:
      "Ugradnja, servis i održavanje sustava grijanja u Našicama i Slavoniji - centralno grijanje, podno grijanje i toplinske pumpe.",
    extraKeywords: [
      "ugradnja grijanja Našice",
      "instalacije grijanja Slavonija",
      "servis centralnog grijanja",
      "posjedujemo sve potrebne certifikate za instalacije grijanja",
      "certificirani instalateri grijanja",
    ],
  },
  "voda-i-kanalizacija": {
    title: "Vodoinstalacije i kanalizacija - Našice | Quintus",
    description:
      "Vodoinstalaterski radovi i uređenje kanalizacije u Našicama i Slavoniji - ugradnja, popravci i održavanje vodovodnih instalacija.",
    extraKeywords: [
      "vodoinstalacije Našice",
      "kanalizacija Slavonija",
      "vodoinstalater Našice",
      "posjedujemo sve potrebne certifikate za vodoinstalaterske radove",
      "certificirani vodoinstalateri",
    ],
  },
};

export function getServiceSeoOverride(slug) {
  return SERVICE_SEO_OVERRIDES[slug] ?? null;
}

export default getServiceSeoOverride;
