import ContactForm from "@/components/Home/ContactForm";
import ContactInfo from "@/components/Home/ContactInfo";
import ContactSettingsEditor from "@/components/Home/editors/ContactSettingsEditor";

export default function ContactSection({
  settingsId,
  address,
  contactEmail,
  phoneNumber,
  onSettingsChanged,
}) {
  return (
    <section id="contact" className="contact editable-block">
      <div className="contact-inner">
        <div className="contact-header">
          <div className="contact-kicker">Kontakt</div>
          <h2 className="contact-title">Kontaktirajte nas</h2>
          <p className="contact-subtitle">
            Imate pitanje ili želite ponudu? Javite nam se s povjerenjem.
          </p>
        </div>

        <div className="contact-layout">
          <div className="contact-panel contact-panel--info" data-anim-delay-ms="0">
            <ContactInfo
              address={address}
              contactEmail={contactEmail}
              phoneNumber={phoneNumber}
            />
          </div>
          <div className="contact-panel contact-panel--form" data-anim-delay-ms="140">
            <ContactForm />
          </div>
        </div>
      </div>

      <ContactSettingsEditor
        settingsId={settingsId}
        address={address}
        contactEmail={contactEmail}
        phoneNumber={phoneNumber}
        onSettingsChanged={onSettingsChanged}
      />
    </section>
  );
}
