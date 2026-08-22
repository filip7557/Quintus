"use client";

import { useEffect, useMemo, useState } from "react";

import Animations from "@/components/Animations";
import NavBar from "@/components/NavBar/NavBar";

import HeroSection from "@/components/Home/HeroSection";
import ServicesSection from "@/components/Home/ServicesSection";
import AboutSection from "@/components/Home/AboutSection";
import ContactSection from "@/components/Home/ContactSection";
import LogoMarquee from "@/components/Home/LogoMarquee";
import SiteFooter from "@/components/Home/SiteFooter";
import ScrollToTop from "@/components/Home/ScrollToTop";

import { API_BASE_URL, API_BASE_URL_FALLBACK } from "@/lib/apiBaseUrl";

function pick(settings, pascalKey, camelKey) {
  if (!settings) return undefined;
  return settings[pascalKey] ?? settings[camelKey];
}

function normalizeEnumerable(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && Array.isArray(value.$values)) {
    return value.$values;
  }
  return value;
}

function unwrapSettingsPayload(payload) {
  if (!payload || typeof payload !== "object") return payload;

  const directCandidates = [
    payload,
    payload.data,
    payload.Data,
    payload.result,
    payload.Result,
    payload.siteSettings,
    payload.SiteSettings,
  ].filter(Boolean);

  let settings = directCandidates.find(
    (item) => item && typeof item === "object" && !Array.isArray(item)
  );

  if (!settings) {
    const asArray = normalizeEnumerable(payload);
    settings = Array.isArray(asArray) ? asArray[0] : payload;
  }

  if (!settings || typeof settings !== "object") return settings;

  return {
    ...settings,
    Services: normalizeEnumerable(settings.Services),
    services: normalizeEnumerable(settings.services),
  };
}

function normalizeBaseUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function hasUsableSettings(value) {
  if (!value || typeof value !== "object") return false;

  const title = pick(value, "Title", "title");
  const description = pick(value, "Description", "description");
  const services = pick(value, "Services", "services");

  if (typeof title === "string" && title.trim()) return true;
  if (typeof description === "string" && description.trim()) return true;
  if (Array.isArray(services) && services.length > 0) return true;

  return false;
}

function getClientBaseCandidates() {
  const fromConfig = [
    normalizeBaseUrl(API_BASE_URL),
    normalizeBaseUrl(API_BASE_URL_FALLBACK),
  ];

  const locationCandidates = [];
  if (typeof window !== "undefined") {
    const origin = window.location?.origin;
    if (origin) {
      locationCandidates.push(`${origin}/api`);
      if (origin.includes("://www.")) {
        locationCandidates.push(`${origin.replace("://www.", "://")}/api`);
      } else {
        const m = origin.match(/^(https?:\/\/)(.+)$/i);
        if (m) {
          locationCandidates.push(`${m[1]}www.${m[2]}/api`);
        }
      }
    }
  }

  return Array.from(
    new Set([...fromConfig, ...locationCandidates].map(normalizeBaseUrl).filter(Boolean))
  );
}

export default function HomePageContent({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings ?? null);
  const hasData = hasUsableSettings(settings);

  useEffect(() => {
    if (hasData) return;

    let cancelled = false;

    const run = async () => {
      const bases = getClientBaseCandidates();
      const routes = ["/SiteSettings", "/siteSettings"];

      for (const base of bases) {
        for (const route of routes) {
          const url = `${base}${route}`;
          try {
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) continue;
            const payload = await response.json();
            const parsed = unwrapSettingsPayload(payload);
            if (!cancelled) {
              setSettings(parsed && hasUsableSettings(parsed) ? parsed : null);
            }
            return;
          } catch {
            // Try next candidate.
          }
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [hasData]);

  const viewModel = useMemo(() => {
    const settingsId = pick(settings, "Id", "id");

    const heroBackgroundImageUrl = pick(
      settings,
      "HeroBackgroundImageUrl",
      "heroBackgroundImageUrl"
    );
    const heroBackgroundImageMobileUrl = pick(
      settings,
      "HeroBackgroundImageMobileUrl",
      "heroBackgroundImageMobileUrl"
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

    return {
      settingsId,
      heroBackgroundImageUrl,
      heroBackgroundImageMobileUrl,
      heroTitle,
      heroDescription,
      services,
      aboutUs,
      aboutUsImageUrl,
      address,
      phoneNumber,
      contactEmail,
      oib,
      brojObrtnice,
      iban,
    };
  }, [settings]);

  return (
    <>
      <Animations />

      <NavBar />

      <main>
        <HeroSection
          settingsId={viewModel.settingsId}
          title={viewModel.heroTitle}
          description={viewModel.heroDescription}
          backgroundImageUrl={viewModel.heroBackgroundImageUrl}
          backgroundImageMobileUrl={viewModel.heroBackgroundImageMobileUrl}
        />
        <ServicesSection services={viewModel.services} />
        <AboutSection
          settingsId={viewModel.settingsId}
          aboutUs={viewModel.aboutUs}
          aboutUsImageUrl={viewModel.aboutUsImageUrl}
        />
        <ContactSection
          settingsId={viewModel.settingsId}
          address={viewModel.address}
          contactEmail={viewModel.contactEmail}
          phoneNumber={viewModel.phoneNumber}
        />
        <LogoMarquee />
      </main>

      <SiteFooter
        settingsId={viewModel.settingsId}
        oib={viewModel.oib}
        brojObrtnice={viewModel.brojObrtnice}
        iban={viewModel.iban}
      />
      <ScrollToTop />
    </>
  );
}
