// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Quintus | Stručne instalaterske usluge",
  description:
    "Klimatizacija, grijanje i vodoinstalacije – stručne usluge po pristupačnim cijenama.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hr">
      <body id="home">{children}</body>
    </html>
  );
}
