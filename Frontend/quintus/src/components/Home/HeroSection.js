import Image from "next/image";
import HeroSettingsEditor from "@/components/Home/editors/HeroSettingsEditor";

export default function HeroSection({
  settingsId,
  title,
  description,
  backgroundImageUrl,
  backgroundImageMobileUrl,
  onSettingsChanged,
}) {
  const safeTitle = String(title ?? "").trim();
  const safeDescription = String(description ?? "").trim();
  const src = String(backgroundImageUrl ?? "").trim();
  // Mobile falls back to the desktop image when no mobile-specific image is set.
  const mobileSrc = String(backgroundImageMobileUrl ?? "").trim() || src;
  const hasBg = Boolean(src);
  const hasMobileBg = Boolean(mobileSrc);

  return (
    <section id="home" className="hero editable-block">
      <div className="hero-bg hero-bg--desktop" aria-hidden="true">
        {hasBg ? (
          <Image
            src={src}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 0px, 100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        ) : null}
      </div>
      <div className="hero-bg hero-bg--mobile" aria-hidden="true">
        {hasMobileBg ? (
          <Image
            src={mobileSrc}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 0px"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        ) : null}
      </div>
      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-container">
        <h1 className="hero-title">{safeTitle || "Nije postavljeno"}</h1>
        {safeDescription ? (
          <p className="hero-subtitle">{safeDescription}</p>
        ) : null}
        <div className="hero-buttons">
          <a href="#services" className="hero-button">
            Naše usluge
          </a>
          <a href="/create-request" className="hero-button">
            Zatraži uslugu
          </a>
        </div>
      </div>

      <HeroSettingsEditor
        settingsId={settingsId}
        heroBackgroundImageUrl={backgroundImageUrl}
        heroBackgroundImageMobileUrl={backgroundImageMobileUrl}
        title={safeTitle}
        description={safeDescription}
        onSettingsChanged={onSettingsChanged}
      />
    </section>
  );
}
