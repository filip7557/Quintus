import Animations from "../components/Animations";
import NavBar from "@/components/NavBar/NavBar";

import HeroSection from "@/components/Home/HeroSection";
import ServicesSection from "@/components/Home/ServicesSection";
import AboutSection from "@/components/Home/AboutSection";
import ContactSection from "@/components/Home/ContactSection";
import SiteFooter from "@/components/Home/SiteFooter";
import ScrollToTop from "@/components/Home/ScrollToTop";

import { getSiteSettings } from "@/services/siteSettingsService";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function pick(settings, pascalKey, camelKey) {
  if (!settings) return undefined;
  return settings[pascalKey] ?? settings[camelKey];
}

export default async function HomePage() {
  const settings = await getSiteSettings();

  const settingsId = pick(settings, "Id", "id");

  const heroBackgroundImageUrl = pick(
    settings,
    "HeroBackgroundImageUrl",
    "heroBackgroundImageUrl"
  );
  const heroTitle = pick(settings, "Title", "title");
  const heroDescription = pick(settings, "Description", "description");

  const services = pick(settings, "Services", "services");

  const aboutUs = pick(settings, "AboutUs", "aboutUs");
  const aboutUsImageUrl = pick(settings, "AboutUsImageUrl", "aboutUsImageUrl");

  const address = pick(settings, "Address", "address");
  const phoneNumber = pick(settings, "PhoneNumber", "phoneNumber");
  const contactEmail = pick(settings, "ContactEmail", "contactEmail");

  const oib = pick(settings, "Oib", "oib");
  const brojObrtnice = pick(settings, "BrojObrtnice", "brojObrtnice");
  const iban = pick(settings, "Iban", "iban");

  return (
    <>
      <Animations />

      <NavBar />

      <main>
        <HeroSection
          settingsId={settingsId}
          title={heroTitle}
          description={heroDescription}
          backgroundImageUrl={heroBackgroundImageUrl}
        />
        <ServicesSection services={services} />
        <AboutSection
          settingsId={settingsId}
          aboutUs={aboutUs}
          aboutUsImageUrl={aboutUsImageUrl}
        />
        <ContactSection
          settingsId={settingsId}
          address={address}
          contactEmail={contactEmail}
          phoneNumber={phoneNumber}
        />
      </main>

      <SiteFooter
        settingsId={settingsId}
        oib={oib}
        brojObrtnice={brojObrtnice}
        iban={iban}
      />
      <ScrollToTop />
    </>
  );
}
