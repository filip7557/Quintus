// app/layout.tsx
import "./globals.css";
import { ToastProvider } from "@/components/Common/ToastProvider";

const fallbackSiteUrl = "http://localhost:3000";

function getMetadataBase() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    return new URL(configuredUrl || fallbackSiteUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

export const metadata = {
  metadataBase: getMetadataBase(),
  title: "Quintus | Stručne instalaterske usluge",
  description:
    "Klimatizacija, grijanje i vodoinstalacije – stručne usluge po pristupačnim cijenama.",
  openGraph: {
    title: "Quintus | Stručne instalaterske usluge",
    description:
      "Klimatizacija, grijanje i vodoinstalacije – stručne usluge po pristupačnim cijenama.",
    url: "/",
    siteName: "Quintus",
    locale: "hr_HR",
    type: "website",
    images: [
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "Quintus logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quintus | Stručne instalaterske usluge",
    description:
      "Klimatizacija, grijanje i vodoinstalacije – stručne usluge po pristupačnim cijenama.",
    images: ["/images/logo.png"],
  },
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
