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
  applicationName: "Quintus",
  title: "Quintus | Obrt za vodu, plin, grijanje i klimatizaciju - Našice",
  description:
    "Ovlašteni monteri klima uređaja za montažu, servis i održavanje u Našicama i Slavoniji. Quintus pruža i usluge grijanja, vode i plina.",
  keywords: [
    "ovlašteni monteri klima uređaja",
    "ovlašteni monter klime",
    "montaža klima uređaja",
    "ugradnja klima uređaja",
    "servis klima uređaja",
    "održavanje klima uređaja",
    "klimatizacija Našice",
    "klimatizacija Slavonija",
    "instalacije grijanja",
    "vodoinstalacije",
    "plinske instalacije",
  ],
  manifest: "/manifest.webmanifest",
  other: {
    "theme-color": "#333a3d",
  },
  alternates: {
    canonical: "https://www.instalacije-quintus.hr",
    languages: {
      hr: "https://www.instalacije-quintus.hr",
    },
  },
  openGraph: {
    title: "Quintus | Obrt za vodu, plin, grijanje i klimatizaciju - Našice",
    description:
      "Ovlašteni monteri klima uređaja za montažu, servis i održavanje u Našicama i Slavoniji. Quintus pruža i usluge grijanja, vode i plina.",
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
    title: "Quintus | Obrt za vodu, plin, grijanje i klimatizaciju - Našice",
    description:
      "Ovlašteni monteri klima uređaja za montažu, servis i održavanje u Našicama i Slavoniji. Quintus pruža i usluge grijanja, vode i plina.",
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
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.instalacije-quintus.hr/#website",
    name: "Quintus",
    alternateName: "Instalacije Quintus",
    url: "https://www.instalacije-quintus.hr/",
  };

  return (
    <html lang="hr" data-scroll-behavior="smooth">
      <body id="home">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c"),
          }}
        />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
