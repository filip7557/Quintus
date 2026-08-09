export default function manifest() {
  return {
    name: "Quintus",
    short_name: "Quintus",
    description:
      "Klimatizacija, grijanje i vodoinstalacije – stručne usluge po pristupačnim cijenama.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#101010",
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