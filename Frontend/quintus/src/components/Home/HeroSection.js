import Image from "next/image";
import HeroSettingsEditor from "@/components/Home/editors/HeroSettingsEditor";

export default function HeroSection({
  settingsId,
  title,
  description,
  backgroundImageUrl,
}) {
  const safeTitle = String(title ?? "").trim();
  const safeDescription = String(description ?? "").trim();
  const src = String(backgroundImageUrl ?? "").trim();
  const hasBg = Boolean(src);

  return (
    <section id="home" className="hero editable-block">
      <div className="hero-bg" aria-hidden="true">
        {hasBg ? (
          <Image
            src={src}
            alt=""
            fill
            priority
            sizes="100vw"
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
        title={safeTitle}
        description={safeDescription}
      />
    </section>
  );
}
