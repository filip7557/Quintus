"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useCanManageSite from "@/hooks/useCanManageSite";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import EditButton from "@/components/Common/EditButton";
import {
  patchAboutUs,
  patchAboutUsImage,
} from "@/services/siteSettingsClientService";
import { useToast } from "@/components/Common/ToastProvider";

export default function AboutSettingsEditor({
  settingsId,
  aboutUs,
  aboutUsImageUrl,
  onSettingsChanged,
}) {
  const router = useRouter();
  const { canManage } = useCanManageSite();
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const imgPreviewUrl = useMemo(() => {
    if (!imgFile) return "";
    return URL.createObjectURL(imgFile);
  }, [imgFile]);

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    setText(aboutUs || "");
    setImgFile(null);
    setError("");
  }, [open, aboutUs, aboutUsImageUrl]);

  useEffect(() => {
    return () => {
      if (imgPreviewUrl) URL.revokeObjectURL(imgPreviewUrl);
    };
  }, [imgPreviewUrl]);

  if (!canManage) return null;

  const onClose = () => {
    if (submitting) return;
    setOpen(false);
  };

  const onSave = async () => {
    setError("");
    setSubmitting(true);
    try {
      if ((text ?? "") !== (aboutUs ?? "")) {
        const resp = await patchAboutUs(text ?? "");
        const ok = resp?.status === 200 || resp?.status === 204;
        if (!ok) throw new Error(resp?.data?.message || "Greška pri spremanju postavki.");
      }

      if (imgFile) {
        const resp = await patchAboutUsImage(imgFile);
        const ok = resp?.status === 200 || resp?.status === 204;
        if (!ok) throw new Error(resp?.data?.message || "Greška pri spremanju postavki.");
      }

      setOpen(false);
      showToast({ type: "success", title: "Spremljeno", message: "O nama je ažurirano." });
      await onSettingsChanged?.();
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
              <h3>Uredi O nama</h3>
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
                Tekst
                <textarea
                  className="modal-textarea"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                />
              </label>

              <div className="modal-help">
                Slika se sada uploada (IFormFile). Ako ne odaberete novu sliku,
                postojeća ostaje.
              </div>

              <label className="modal-file" aria-label="Odaberi sliku">
                Odaberi sliku
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImgFile(e.target.files?.[0] ?? null)}
                  disabled={submitting}
                />
              </label>

              {imgPreviewUrl ? (
                <div className="image-preview-grid" style={{ marginTop: 12 }}>
                  <div className="image-preview-item">
                    <Image
                      src={imgPreviewUrl}
                      alt="Preview"
                      fill
                      unoptimized
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              ) : aboutUsImageUrl ? (
                <div className="image-preview-grid" style={{ marginTop: 12 }}>
                  <div className="image-preview-item">
                    <Image
                      src={aboutUsImageUrl}
                      alt="Trenutna slika"
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
                onClick={onSave}
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
