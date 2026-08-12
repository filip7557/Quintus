// app/layout.tsx
import "./globals.css";
import { ToastProvider } from "@/components/Common/ToastProvider";

const fallbackSiteUrl = "https://www.instalacije-quintus.hr"; // Fallback URL if NEXT_PUBLIC_SITE_URL is not set or invalid

function getMetadataBase() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    return new URL(configuredUrl || fallbackSiteUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

export const viewport = {
  themeColor: "#333a3d",
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  metadataBase: getMetadataBase(),
  title: "Quintus | Stručne instalaterske usluge",
  description:
    "Klimatizacija, grijanje i vodoinstalacije – stručne usluge po pristupačnim cijenama.",
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://www.instalacije-quintus.hr",
    languages: {
      hr: "https://www.instalacije-quintus.hr",
    },
  },
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
        url: "https://www.instalacije-quintus.hr/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdzhmn7c4d%2Fimage%2Fupload%2Fv1780157613%2Fquintus_images%2Fzv34ptnsgknm1jookolw.png&w=640&q=75",
        width: 640,
        height: 640,
        alt: "Quintus logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quintus | Stručne instalaterske usluge",
    description:
      "Klimatizacija, grijanje i vodoinstalacije – stručne usluge po pristupačnim cijenama.",
    images: [
      "https://www.instalacije-quintus.hr/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdzhmn7c4d%2Fimage%2Fupload%2Fv1780157613%2Fquintus_images%2Fzv34ptnsgknm1jookolw.png&w=640&q=75",
    ],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
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
