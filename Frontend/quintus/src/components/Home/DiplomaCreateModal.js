"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/Common/ToastProvider";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

function passthroughLoader({ src }) {
  return src;
}

export default function DiplomaCreateModal({ open, onClose, onSubmit }) {
  const { showToast } = useToast();
  useLockBodyScroll(open);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null); // { file, url }
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    setTitle("");
    setDescription("");
    setUrl("");
    setError("");
    setImage((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, submitting]);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && description.trim().length > 0 && !!image?.file;
  }, [title, description, image]);

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return { file, url: URL.createObjectURL(file) };
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = () => {
    setImage((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
  };

  const handleSubmit = async () => {
    setError("");
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      const response = await onSubmit?.({
        title: title.trim(),
        description: description.trim(),
        image: image.file,
        url: url.trim(),
      });

      const ok = response?.status === 200 || response?.status === 201 || response === undefined;
      if (!ok) {
        setError(response?.data?.message || "Greška pri spremanju certifikata.");
        showToast({
          type: "error",
          title: "Neuspješno",
          message: response?.data?.message || "Greška pri spremanju.",
        });
        return;
      }

      showToast({ type: "success", title: "Spremljeno", message: "Certifikat je dodan." });
      onClose?.();
    } catch {
      setError("Greška pri spremanju certifikata. Pokušajte ponovno.");
      showToast({ type: "error", title: "Greška", message: "Pokušajte ponovno." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (submitting) return;
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" ref={dialogRef}>
        <div className="modal-header">
          <h3>Dodaj certifikat</h3>
          <button
            type="button"
            className="modal-close"
            onClick={() => {
              if (submitting) return;
              onClose?.();
            }}
            aria-label="Zatvori"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        {error ? <div className="modal-error">{error}</div> : null}

        <div className="modal-body">
          <div className="modal-row">
            <label className="modal-label" style={{ flex: 1 }}>
              Naslov *
              <input
                className="modal-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Npr. Grijanje"
                maxLength={200}
              />
            </label>
            <label className="modal-label" style={{ flex: 1 }}>
              URL
              <input
                className="modal-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>

          <label className="modal-label">
            Opis *
            <textarea
              className="modal-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kratak opis certifikata"
              rows={5}
              maxLength={1000}
            />
          </label>

          <div className="modal-row" style={{ alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div className="modal-label">Slika *</div>
              <div className="modal-help">Odaberite sliku certifikata ili diplome.</div>
            </div>
            <label className="modal-file">
              Odaberi
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
              />
            </label>
          </div>

          {image ? (
            <div style={{ maxWidth: 160 }}>
              <div className="image-preview-item">
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="160px"
                  style={{ objectFit: "cover" }}
                  loader={passthroughLoader}
                  unoptimized
                />
                <button
                  type="button"
                  className="image-remove"
                  onClick={removeImage}
                  aria-label="Ukloni sliku"
                >
                  ×
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-secondary"
            onClick={() => {
              if (submitting) return;
              onClose?.();
            }}
            disabled={submitting}
          >
            Odustani
          </button>
          <button
            type="button"
            className="modal-primary"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Spremanje..." : "Spremi"}
          </button>
        </div>
      </div>
    </div>
  );
}
