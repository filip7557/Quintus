"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/Common/ToastProvider";
import { postContact } from "@/services/contactService";

export default function ContactForm() {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      String(fullName).trim().length > 0 &&
      String(email).trim().length > 0 &&
      String(message).trim().length > 0
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
          <span className="contact-field-label">Ime i prezime</span>
          <input
            type="text"
            name="name"
            placeholder="npr. Ivan Horvat"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={submitting}
          />
        </label>

        <label className="contact-field">
          <span className="contact-field-label">Email adresa</span>
          <input
            type="email"
            name="email"
            placeholder="npr. ivan@email.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </label>

        <label className="contact-field">
          <span className="contact-field-label">Poruka</span>
          <textarea
            name="message"
            rows={5}
            placeholder="Kratko opišite što trebate..."
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={submitting}
          />
        </label>

        <div className="contact-form-hint">Odgovaramo u najkraćem mogućem roku.</div>
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
