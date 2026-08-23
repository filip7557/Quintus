import { getSiteUrl } from "@/lib/siteUrl";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/users", "/api/", "/profile/", "/schedule"],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
