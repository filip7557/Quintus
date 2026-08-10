import HomePageContent from "@/components/Home/HomePageContent";

import { getSiteSettings } from "@/services/siteSettingsService";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const settings = await getSiteSettings();
  return <HomePageContent initialSettings={settings} />;
}
