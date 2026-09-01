import { getSiteUrl } from "@/lib/siteUrl";
import { slugify } from "@/lib/slugify";
import { getSiteSettings } from "@/services/siteSettingsService";

// Fetch services at request time; the backend API isn't reachable during `next build`,
// which would otherwise bake an empty service list into a statically generated sitemap.
export const dynamic = "force-dynamic";

const siteUrl = getSiteUrl();

const routes = [
  { url: "/", changeFrequency: "weekly", priority: 1.0 },
  { url: "/#services", changeFrequency: "weekly", priority: 0.9 },
  { url: "/#about", changeFrequency: "monthly", priority: 0.8 },
  { url: "/#contact", changeFrequency: "monthly", priority: 0.8 },
  { url: "/politika-privatnosti", changeFrequency: "yearly", priority: 0.6 },
];

function getServiceTitle(service) {
  return service?.Title ?? service?.title ?? "";
}

async function buildServiceRoutes() {
  const settings = await getSiteSettings();
  const services = Array.isArray(settings?.Services ?? settings?.services)
    ? (settings.Services ?? settings.services)
    : [];

  const seenSlugs = new Set();
  const serviceRoutes = [];

  for (const service of services) {
    const slug = slugify(getServiceTitle(service));
    if (!slug || seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    serviceRoutes.push({
      url: `/usluge/${slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return serviceRoutes;
}

export default async function sitemap() {
  const serviceRoutes = await buildServiceRoutes();

  return [...routes, ...serviceRoutes].map((route) => ({
    url: `${siteUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
