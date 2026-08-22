import HomePageContent from "@/components/Home/HomePageContent";
import LocalBusinessJsonLd from "@/components/Seo/LocalBusinessJsonLd";

import { getSiteSettings } from "@/services/siteSettingsService";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const PRODUCTION_INTERNAL_API_BASE_URL =
  process.env.INTERNAL_API_BASE_URL || "http://backend:8080/api";

export default async function HomePage() {
  const settings = await getSiteSettings({
    baseUrl:
      process.env.NODE_ENV === "production"
        ? PRODUCTION_INTERNAL_API_BASE_URL
        : undefined,
  });
  return (
    <>
      <LocalBusinessJsonLd settings={settings} />
      <HomePageContent initialSettings={settings} />
    </>
  );
}
