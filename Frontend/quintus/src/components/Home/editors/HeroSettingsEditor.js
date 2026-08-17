"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useCanManageSite from "@/hooks/useCanManageSite";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import EditButton from "@/components/Common/EditButton";
import {
  patchDescription,
  patchHeroBackgroundImage,
  patchHeroBackgroundImageMobile,
  patchTitle,
} from "@/services/siteSettingsClientService";
import { useToast } from "@/components/Common/ToastProvider";

export default function HeroSettingsEditor({
  settingsId,
  heroBackgroundImageUrl,
  heroBackgroundImageMobileUrl,
  title,
  description,
}) {
  const router = useRouter();
  const { canManage } = useCanManageSite();
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [bgOnlyOpen, setBgOnlyOpen] = useState(false);
  const [bgFile, setBgFile] = useState(null);
  const [bgMobileFile, setBgMobileFile] = useState(null);
  const [t, setT] = useState("");
  const [d, setD] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const bgPreviewUrl = useMemo(() => {
    if (!bgFile) return "";
    return URL.createObjectURL(bgFile);
  }, [bgFile]);

  const bgMobilePreviewUrl = useMemo(() => {
    if (!bgMobileFile) return "";
    return URL.createObjectURL(bgMobileFile);
  }, [bgMobileFile]);

  useLockBodyScroll(open || bgOnlyOpen);

  useEffect(() => {
    if (!open && !bgOnlyOpen) return;
    setBgFile(null);
    setBgMobileFile(null);
    if (open) {
      setT(title || "");
      setD(description || "");
    }
    setError("");
  }, [open, bgOnlyOpen, heroBackgroundImageUrl, heroBackgroundImageMobileUrl, title, description]);

  useEffect(() => {
    return () => {
      if (bgPreviewUrl) URL.revokeObjectURL(bgPreviewUrl);
    };
  }, [bgPreviewUrl]);

  useEffect(() => {
    return () => {
      if (bgMobilePreviewUrl) URL.revokeObjectURL(bgMobilePreviewUrl);
    };
  }, [bgMobilePreviewUrl]);

  if (!canManage) return null;

  const onClose = () => {
    if (submitting) return;
    setOpen(false);
    setBgOnlyOpen(false);
  };

  const onSave = async () => {
    setError("");
    setSubmitting(true);
    try {
      if ((t ?? "") !== (title ?? "")) {
        const resp = await patchTitle(t ?? "");
        const ok = resp?.status === 200 || resp?.status === 204;
        if (!ok) throw new Error(resp?.data?.message || "Greška pri spremanju postavki.");
      }

      if ((d ?? "") !== (description ?? "")) {
        const resp = await patchDescription(d ?? "");
        const ok = resp?.status === 200 || resp?.status === 204;
        if (!ok) throw new Error(resp?.data?.message || "Greška pri spremanju postavki.");
      }

      setOpen(false);
      showToast({ type: "success", title: "Spremljeno", message: "Hero je ažuriran." });
      router.refresh();
    } catch (e) {
      const msg = e?.message || "Greška pri spremanju postavki.";
      setError(msg);
      showToast({ type: "error", title: "Greška", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveBgOnly = async () => {
    setError("");
    setSubmitting(true);
    try {
      if (!bgFile && !bgMobileFile) throw new Error("Molimo odaberite barem jednu sliku.");

      if (bgFile) {
        const resp = await patchHeroBackgroundImage(bgFile);
        const ok = resp?.status === 200 || resp?.status === 204;
        if (!ok) throw new Error(resp?.data?.message || "Greška pri spremanju postavki.");
      }

      if (bgMobileFile) {
        const resp = await patchHeroBackgroundImageMobile(bgMobileFile);
        const ok = resp?.status === 200 || resp?.status === 204;
        if (!ok) throw new Error(resp?.data?.message || "Greška pri spremanju postavki.");
      }

      setBgOnlyOpen(false);
      showToast({ type: "success", title: "Spremljeno", message: "Pozadina je ažurirana." });
      router.refresh();
    } catch (e) {
      const msg = e?.message || "Greška pri spremanju postavki.";
      setError(msg);
      showToast({ type: "error", title: "Greška", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <EditButton onClick={() => setOpen(true)} />

      <button
        type="button"
        className="hero-bg-edit-button"
        onClick={() => setBgOnlyOpen(true)}
      >
        <span className="hero-bg-edit-icon" aria-hidden="true">
          ✎
        </span>
        Pozadina
      </button>

      {open ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={(e) => {
            if (submitting) return;
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h3>Uredi Hero</h3>
              <button
                type="button"
                className="modal-close"
                onClick={onClose}
                aria-label="Zatvori"
                disabled={submitting}
              >
                ×
              </button>
            </div>

            {error ? <div className="modal-error">{error}</div> : null}

            <div className="modal-body">
              <label className="modal-label">
                Naslov
                <input
                  className="modal-input"
                  value={t}
                  onChange={(e) => setT(e.target.value)}
                  maxLength={140}
                />
              </label>

              <label className="modal-label">
                Opis
                <textarea
                  className="modal-textarea"
                  value={d}
                  onChange={(e) => setD(e.target.value)}
                  rows={5}
                  maxLength={600}
                />
              </label>

              <div className="modal-help">
                Pozadinu mijenjate preko gumba &quot;Pozadina&quot; dolje desno.
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Odustani
              </button>
              <button
                type="button"
                className="modal-primary"
                onClick={onSave}
                disabled={submitting}
              >
                {submitting ? "Spremanje..." : "Spremi"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {bgOnlyOpen ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={(e) => {
            if (submitting) return;
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h3>Uredi pozadinu</h3>
              <button
                type="button"
                className="modal-close"
                onClick={onClose}
                aria-label="Zatvori"
                disabled={submitting}
              >
                ×
              </button>
            </div>

            {error ? <div className="modal-error">{error}</div> : null}

            <div className="modal-body">
              <div className="modal-help">
                Odaberite sliku za pozadinu na širokim ekranima (desktop, laptop, tablet).
              </div>

              <label className="modal-file" aria-label="Odaberi sliku za širok ekran">
                Odaberi sliku (širok ekran)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBgFile(e.target.files?.[0] ?? null)}
                  disabled={submitting}
                />
              </label>

              {bgPreviewUrl ? (
                <div className="image-preview-grid" style={{ marginTop: 12 }}>
                  <div className="image-preview-item">
                    <Image
                      src={bgPreviewUrl}
                      alt="Preview"
                      fill
                      unoptimized
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              ) : heroBackgroundImageUrl ? (
                <div className="image-preview-grid" style={{ marginTop: 12 }}>
                  <div className="image-preview-item">
                    <Image
                      src={heroBackgroundImageUrl}
                      alt="Trenutna pozadina"
                      fill
                      sizes="(max-width: 640px) 100vw, 420px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              ) : null}

              <div className="modal-help" style={{ marginTop: 20 }}>
                Odaberite sliku za pozadinu na visokim ekranima (mobiteli). Ako nije postavljena, koristi se slika za širok ekran.
              </div>

              <label className="modal-file" aria-label="Odaberi sliku za visok ekran">
                Odaberi sliku (mobitel)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBgMobileFile(e.target.files?.[0] ?? null)}
                  disabled={submitting}
                />
              </label>

              {bgMobilePreviewUrl ? (
                <div className="image-preview-grid" style={{ marginTop: 12 }}>
                  <div className="image-preview-item">
                    <Image
                      src={bgMobilePreviewUrl}
                      alt="Preview"
                      fill
                      unoptimized
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              ) : heroBackgroundImageMobileUrl ? (
                <div className="image-preview-grid" style={{ marginTop: 12 }}>
                  <div className="image-preview-item">
                    <Image
                      src={heroBackgroundImageMobileUrl}
                      alt="Trenutna pozadina za mobitel"
                      fill
                      sizes="(max-width: 640px) 100vw, 420px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Odustani
              </button>
              <button
                type="button"
                className="modal-primary"
                onClick={onSaveBgOnly}
                disabled={submitting}
              >
                {submitting ? "Spremanje..." : "Spremi"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
