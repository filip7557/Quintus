export default function manifest() {
  return {
    name: "Quintus",
    short_name: "Quintus",
    description:
      "Klimatizacija, grijanje i vodoinstalacije – Pouzdana usluga, kvalitetna izvedba i dugoročna rješenja prilagođena vašim potrebama.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#333a3d",
    theme_color: "#007bff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
        purpose: "any",
      },
    ],
  };
}