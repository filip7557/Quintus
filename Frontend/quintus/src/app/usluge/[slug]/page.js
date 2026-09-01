import { notFound } from "next/navigation";
import { getSiteSettings } from "@/services/siteSettingsService";
import { slugify } from "@/lib/slugify";
import { getSiteUrl } from "@/lib/siteUrl";
import { getServiceSeoOverride } from "@/lib/serviceSeo";
import ServiceJsonLd from "@/components/Seo/ServiceJsonLd";
import ServiceDetailView from "@/components/Services/ServiceDetailView";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const PRODUCTION_INTERNAL_API_BASE_URL =
  process.env.INTERNAL_API_BASE_URL || "http://backend:8080/api";

async function fetchSettings() {
  return getSiteSettings({
    baseUrl:
      process.env.NODE_ENV === "production"
        ? PRODUCTION_INTERNAL_API_BASE_URL
        : undefined,
  });
}

function getServices(settings) {
  const value = settings?.Services ?? settings?.services;
  return Array.isArray(value) ? value : [];
}

async function findServiceBySlug(slug) {
  const settings = await fetchSettings();
  const services = getServices(settings);
  return services.find((service) => slugify(service?.Title ?? service?.title) === slug) ?? null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = await findServiceBySlug(slug);

  if (!service) {
    return {
      title: "Usluga nije pronađena | Quintus",
      description: "Tražena usluga ne postoji ili je uklonjena.",
    };
  }

  const title = service.Title ?? service.title;
  const baseDescription = service.Description ?? service.description ?? "";
  const baseKeywords = service.KeyWords ?? service.keyWords ?? service.keywords ?? [];
  const imageUrls = service.ImageUrls ?? service.imageUrls ?? [];
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/usluge/${slug}`;

  const seoOverride = getServiceSeoOverride(slug);
  const pageTitle = seoOverride?.title ?? `${title} | Quintus - Našice`;
  const description = seoOverride?.description ?? baseDescription;
  const keywords = seoOverride?.extraKeywords
    ? [...baseKeywords, ...seoOverride.extraKeywords]
    : baseKeywords;

  return {
    title: pageTitle,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        hr: canonical,
      },
    },
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      siteName: "Quintus",
      locale: "hr_HR",
      type: "website",
      images: imageUrls.length
        ? [{ url: imageUrls[0], width: 1200, height: 800, alt: title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: imageUrls.length ? [imageUrls[0]] : undefined,
    },
  };
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = await findServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <ServiceJsonLd service={service} slug={slug} />
      <ServiceDetailView service={service} />
    </>
  );
}
