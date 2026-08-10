const fallbackSiteUrl = "https://www.instalacije-quintus.hr";

function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;

  if (!configuredUrl) {
    return fallbackSiteUrl;
  }

  try {
    return new URL(configuredUrl).origin;
  } catch {
    return fallbackSiteUrl;
  }
}

const siteUrl = getSiteUrl();

const routes = [
  { url: "/", changeFrequency: "weekly", priority: 1.0 },
  { url: "/#services", changeFrequency: "weekly", priority: 0.9 },
  { url: "/#about", changeFrequency: "monthly", priority: 0.8 },
  { url: "/#contact", changeFrequency: "monthly", priority: 0.8 },
  { url: "/politika-privatnosti", changeFrequency: "yearly", priority: 0.6 },
];

export default function sitemap() {
  return routes.map((route) => ({
    url: `${siteUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
