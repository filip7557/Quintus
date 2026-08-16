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

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/admin/users", "/api/", "/profile/", "/schedule"],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
