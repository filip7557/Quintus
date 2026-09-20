"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { deleteDiploma, getDiplomas } from "@/services/diplomaService";
import { useToast } from "@/components/Common/ToastProvider";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

function passthroughLoader({ src }) {
  return src;
}

export default function DiplomaCreateModal({ open, onClose, onSubmit, diploma, setLocalDiplomas }) {
  const { showToast } = useToast();
  useLockBodyScroll(open);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null); // { file, url }
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);
  const dialogRef = useRef(null);

  const isEdit = diploma ?? false;

  useEffect(() => {
    if (!open) return;

    setTitle(diploma?.title || "");
    setDescription(diploma?.description || "");
    setUrl(diploma?.url || "");
    setError("");
    setImage((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return diploma?.imageUrl ? { file: null, url: diploma.imageUrl } : null;
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
    return title.trim().length > 0 && description.trim().length > 0 && (image?.file || isEdit);
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

  const handleDelete = async () => {
    if (!deleteDiploma || deleting || submitting) return;
    if (!diploma?.id) {
      setError("Nije moguće obrisati ovaj certifikat.");
      showToast({ type: "error", title: "Greška", message: "Brisanje nije moguće." });
      return;
    }

    const confirmed = window.confirm("Jeste li sigurni da želite obrisati ovaj certifikat?");
    if (!confirmed) return;

    setError("");
    setDeleting(true);
    try {
      const resp = await deleteDiploma(diploma.id);
      const ok = resp?.status === 200 || resp?.status === 204;
      if (!ok) {
        const msg = resp?.data?.message || "Greška pri brisanju certifikata.";
        setError(msg);
        showToast({ type: "error", title: "Neuspješno", message: msg });
        return;
      }

      showToast({ type: "success", title: "Obrisano", message: "Certifikat je obrisan." });
      onClose?.();
      const newDiplomas = await getDiplomas();
      setLocalDiplomas(newDiplomas.data);
    } catch {
      setError("Greška pri brisanju certifikata.");
      showToast({ type: "error", title: "Greška", message: "Pokušajte ponovno." });
    } finally {
      setDeleting(false);
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
          <h3>{isEdit ? "Uredi certifikat" : "Dodaj certifikat"}</h3>
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
              className="modal-danger"
              onClick={handleDelete}
              disabled={submitting || deleting}
            >
              {deleting ? "Brisanje..." : "Obriši"}
            </button>
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
