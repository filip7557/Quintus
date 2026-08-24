import Image from "next/image";
import AboutSettingsEditor from "@/components/Home/editors/AboutSettingsEditor";

function splitParagraphs(text) {
  return String(text || "")
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function AboutSection({
  settingsId,
  aboutUs,
  aboutUsImageUrl,
  onSettingsChanged,
}) {
  const safeAboutUs = String(aboutUs ?? "");
  const paragraphs = splitParagraphs(safeAboutUs);
  const imgSrc = String(aboutUsImageUrl ?? "").trim();
  const hasImage = Boolean(imgSrc);

  return (
    <section id="about" className="about editable-block">
      <div className="about-inner">
        <div className="about-header">
          <div className="about-kicker">Quintus</div>
          <h2 className="about-title">Tko stoji iza Quintus-a?</h2>
        </div>

        <div className={`about-layout${hasImage ? " has-image" : ""}`}>
          {hasImage ? (
            <div className="about-container">
              <div className="about-image-frame">
                <Image
                  src={imgSrc}
                  alt="O nama"
                  fill
                  className="about-image"
                  sizes="(max-width: 600px) 92vw, (max-width: 992px) 86vw, 520px"
                  priority={false}
                />
              </div>
            </div>
          ) : null}

          <div className="about-container">
            <div className="about-panel">
              {paragraphs.length ? (
                paragraphs.map((p, idx) => (
                  <p key={idx} className="about-text">
                    {p}
                  </p>
                ))
              ) : (
                <p className="about-text">Nije postavljeno</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AboutSettingsEditor
        settingsId={settingsId}
        aboutUs={safeAboutUs}
        aboutUsImageUrl={aboutUsImageUrl}
        onSettingsChanged={onSettingsChanged}
      />
    </section>
  );
}
