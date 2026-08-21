"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/Common/ToastProvider";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

function passthroughLoader({ src }) {
  return src;
}

function splitKeywords(input) {
  return String(input || "")
    .split(/[,\n\r;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ServiceCreateModal({
  open,
  onClose,
  onAdd,
  onSubmit,
  onDelete,
  onRemoveImageInstant,
  deleteId,
  deleteLabel = "Obriši",
  deleteConfirmMessage = "Jeste li sigurni da želite obrisati ovu uslugu?",
  modalClassName = "modal",
  heading = "Dodaj uslugu",
  submitLabel = "Spremi",
  initial,
}) {
  const { showToast } = useToast();
  useLockBodyScroll(open);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [images, setImages] = useState([]); // { file, url }
  const [existingImages, setExistingImages] = useState([]); // URLs of existing images
  const [deletedImageUrls, setDeletedImageUrls] = useState([]); // URLs to delete
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [deleteImageUrl, setDeleteImageUrl] = useState(null); // For image delete confirmation

  const dialogRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    setTitle(initial?.title || "");
    setDescription(initial?.description || "");
    setKeywordInput("");
    setKeywords(Array.isArray(initial?.keyWords) ? initial.keyWords : []);
    setError("");
    setDeleteImageUrl(null);
    setDeletedImageUrls([]);

    // Set existing images and cleanup old previews
    setExistingImages(
      Array.isArray(initial?.existingImageUrls) ? [...initial.existingImageUrls] : []
    );

    setImages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (submitting) return;
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, submitting]);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && description.trim().length > 0;
  }, [title, description]);

  const addKeywordsFromInput = () => {
    const next = splitKeywords(keywordInput);
    if (next.length === 0) return;

    setKeywords((prev) => {
      const set = new Set(prev);
      next.forEach((kw) => set.add(kw));
      return Array.from(set);
    });

    setKeywordInput("");
  };

  const removeKeyword = (kw) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImages((prev) => {
      const next = [...prev];
      for (const file of files) {
        next.push({ file, url: URL.createObjectURL(file) });
      }
      return next;
    });

    // allow selecting the same file again later
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImageAt = (idx) => {
    setImages((prev) => {
      const next = [...prev];
      const removed = next.splice(idx, 1)[0];
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  const handleRemoveExistingImage = async (url) => {
    const confirmed = window.confirm(
      "Jeste li sigurni da želite obrisati ovu sliku?"
    );
    if (!confirmed) return;

    // If callback is provided, call API instantly
    if (onRemoveImageInstant) {
      try {
        await onRemoveImageInstant(url);
        setExistingImages((prev) => prev.filter((u) => u !== url));
        showToast({
          type: "success",
          title: "Obrisano",
          message: "Slika je obrisana.",
        });
      } catch (err) {
        showToast({
          type: "error",
          title: "Greška",
          message: "Greška pri brisanju slike.",
        });
      }
    } else {
      // Fallback: mark for deletion on submit
      setExistingImages((prev) => prev.filter((u) => u !== url));
      setDeletedImageUrls((prev) => [...prev, url]);
    }
    setDeleteImageUrl(null);
  };

  const handleSubmit = async () => {
    setError("");
    if (!canSubmit || submitting || deleting) return;

    setSubmitting(true);
    try {
      const submit = onSubmit || onAdd;
      const response = await submit?.({
        title: title.trim(),
        description: description.trim(),
        keyWords: keywords,
        images: images.map((x) => x.file),
        existingImageUrls: existingImages,
        deletedImageUrls: deletedImageUrls,
      });

      const ok = response?.status === 200 || response?.status === 201;
      if (!ok) {
        setError(response?.data?.message || "Greška pri spremanju usluge.");
        showToast({
          type: "error",
          title: "Neuspješno",
          message: response?.data?.message || "Greška pri spremanju.",
        });
        return;
      }

      showToast({ type: "success", title: "Spremljeno", message: "Promjene su spremljene." });
      onClose?.();
    } catch (e) {
      setError("Greška pri spremanju usluge. Pokušajte ponovno.");
      showToast({
        type: "error",
        title: "Greška",
        message: "Pokušajte ponovno.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || deleting || submitting) return;
    if (!deleteId) {
      setError("Nije moguće obrisati ovu uslugu.");
      showToast({ type: "error", title: "Greška", message: "Brisanje nije moguće." });
      return;
    }

    const confirmed = window.confirm(deleteConfirmMessage);
    if (!confirmed) return;

    setError("");
    setDeleting(true);
    try {
      const resp = await onDelete(deleteId);
      const ok = resp?.status === 200 || resp?.status === 204;
      if (!ok) {
        const msg = resp?.data?.message || "Greška pri brisanju usluge.";
        setError(msg);
        showToast({ type: "error", title: "Neuspješno", message: msg });
        return;
      }

      showToast({ type: "success", title: "Obrisano", message: "Usluga je obrisana." });
      onClose?.();
    } catch {
      setError("Greška pri brisanju usluge.");
      showToast({ type: "error", title: "Greška", message: "Pokušajte ponovno." });
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-overlay service-modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (submitting || deleting) return;
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={modalClassName} role="dialog" aria-modal="true" ref={dialogRef}>
        <div className="modal-header">
          <h3>{heading}</h3>
          <button
            type="button"
            className="modal-close"
            onClick={() => {
              if (submitting || deleting) return;
              onClose?.();
            }}
            aria-label="Zatvori"
            disabled={submitting || deleting}
          >
            ×
          </button>
        </div>

        {error ? <div className="modal-error">{error}</div> : null}

        <div className="modal-body">
          <label className="modal-label">
            Naslov *
            <input
              className="modal-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Npr. Klimatizacija"
              maxLength={80}
            />
          </label>

          <label className="modal-label">
            Opis *
            <textarea
              className="modal-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kratak opis usluge"
              rows={5}
              maxLength={600}
            />
          </label>

          <div className="modal-row">
            <label className="modal-label" style={{ flex: 1 }}>
              Ključne riječi
              <input
                className="modal-input"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Upišite pa Enter ili Dodaj (npr. Ugradnja, Servis)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addKeywordsFromInput();
                  }
                }}
              />
            </label>
            <button
              type="button"
              className="modal-secondary"
              onClick={addKeywordsFromInput}
            >
              Dodaj
            </button>
          </div>

          {keywords.length > 0 ? (
            <div className="keyword-chips">
              {keywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  className="keyword-chip"
                  onClick={() => removeKeyword(kw)}
                  aria-label={`Ukloni: ${kw}`}
                  title="Klikni za uklanjanje"
                >
                  {kw} <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="modal-row">
            <div style={{ flex: 1 }}>
              <div className="modal-label">Slike</div>
              <div className="modal-help">
                Možete dodati više slika (jednu po jednu ili odjednom).
              </div>
            </div>
            <label className="modal-file">
              Odaberi
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
              />
            </label>
          </div>

          {images.length > 0 ? (
            <div className="image-preview-grid">
              {images.map((img, idx) => (
                <div key={img.url} className="image-preview-item">
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 40vw, 120px"
                    style={{ objectFit: "cover" }}
                    loader={passthroughLoader}
                    unoptimized
                  />
                  <button
                    type="button"
                    className="image-remove"
                    onClick={() => removeImageAt(idx)}
                    aria-label="Ukloni sliku"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {Array.isArray(initial?.existingImageUrls) &&
          initial.existingImageUrls.length > 0 ? (
            <div>
              <div className="modal-label">Postojeće slike</div>
              <div className="modal-help">
                Nove slike će se dodati uz postojeće. Klikni X za brisanje slike.
              </div>
              <div className="image-preview-grid image-preview-grid-existing">
                {existingImages.map((url) => (
                  <div key={url} className="image-preview-item">
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 40vw, 120px"
                      style={{ objectFit: "cover" }}
                      loader={passthroughLoader}
                      unoptimized
                    />
                    <button
                      type="button"
                      className="image-remove"
                      onClick={() => handleRemoveExistingImage(url)}
                      aria-label="Ukloni sliku"
                      disabled={submitting || deleting}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="modal-actions">
          {onDelete && deleteId ? (
            <button
              type="button"
              className="modal-danger"
              onClick={handleDelete}
              disabled={submitting || deleting}
            >
              {deleting ? "Brisanje..." : deleteLabel}
            </button>
          ) : null}
          <button
            type="button"
            className="modal-secondary"
            onClick={() => {
              if (submitting || deleting) return;
              onClose?.();
            }}
            disabled={submitting || deleting}
          >
            Odustani
          </button>
          <button
            type="button"
            className="modal-primary"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting || deleting}
          >
            {submitting ? "Spremanje..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
