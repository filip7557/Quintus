// app/layout.tsx
import "./globals.css";
import { ToastProvider } from "@/components/Common/ToastProvider";

export const metadata = {
  title: "Quintus | Stručne instalaterske usluge",
  description:
    "Klimatizacija, grijanje i vodoinstalacije – stručne usluge po pristupačnim cijenama.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hr" data-scroll-behavior="smooth">
      <body id="home">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
