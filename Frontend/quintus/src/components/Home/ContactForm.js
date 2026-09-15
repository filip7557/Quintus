"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/Common/ToastProvider";
import { postContact } from "@/services/contactService";
import { getEmailWarning } from "@/lib/formValidation";

export default function ContactForm() {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validationWarning = useMemo(() => {
    const trimmedName = String(fullName).trim();
    const trimmedEmail = String(email).trim();
    const trimmedMessage = String(message).trim();

    if (trimmedName.length > 0 && trimmedName.length < 2)
      return "Ime i prezime moraju imati najmanje 2 znaka.";
    if (trimmedEmail.length > 0 && getEmailWarning(trimmedEmail))
      return getEmailWarning(trimmedEmail);
    if (trimmedMessage.length > 0 && trimmedMessage.length < 10)
      return "Poruka mora imati najmanje 10 znakova.";
    return "";
  }, [fullName, email, message]);

  const canSubmit = useMemo(() => {
    return (
      String(fullName).trim().length >= 2 &&
      String(fullName).trim().length <= 100 &&
      !getEmailWarning(email) &&
      String(message).trim().length >= 10 &&
      String(message).trim().length <= 4000
    );
  }, [fullName, email, message]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      const resp = await postContact({ fullName, email, message });
      const ok = resp?.status === 200 || resp?.status === 201 || resp?.status === 204;
      if (!ok) {
        const msg = resp?.data?.message || "Greška pri slanju poruke.";
        showToast({ type: "error", title: "Neuspješno", message: msg });
        return;
      }

      showToast({ type: "success", title: "Poslano", message: "Poruka je poslana." });
      setFullName("");
      setEmail("");
      setMessage("");
    } catch {
      showToast({ type: "error", title: "Greška", message: "Pokušajte ponovno." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-form">
      <h3 className="contact-panel-title">Pošaljite poruku</h3>
      <form className="contact-form-form" id="contact-form" onSubmit={onSubmit}>
        <label className="contact-field">
          <span className="contact-field-label">Vaše ime i prezime</span>
          <input
            type="text"
            name="name"
            placeholder="npr. Ivan Horvat"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            minLength={2}
            maxLength={100}
            disabled={submitting}
          />
        </label>

        <label className="contact-field">
          <span className="contact-field-label">Vaša email adresa</span>
          <input
            type="email"
            name="email"
            placeholder="npr. ivan@email.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            disabled={submitting}
          />
        </label>

        <label className="contact-field">
          <span className="contact-field-label">Vaša poruka</span>
          <textarea
            name="message"
            rows={5}
            placeholder="Kratko opišite što trebate..."
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            minLength={10}
            maxLength={4000}
            disabled={submitting}
          />
        </label>

        <div className="contact-form-hint" role={validationWarning ? "alert" : undefined}>
          {validationWarning || "Odgovaramo u najkraćem mogućem roku."}
        </div>
        <button
          type="submit"
          className="hero-button"
          disabled={!canSubmit || submitting}
          aria-disabled={!canSubmit || submitting}
        >
          {submitting ? "Slanje..." : "Pošalji poruku"}
        </button>
      </form>
    </div>
  );
}
