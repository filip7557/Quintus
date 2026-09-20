"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

export default function PdfModal({
  open,
  onClose,
  file,
  blob,
  url,
  title = "Pregled dokumenta",
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const dialogRef = useRef(null);

  useLockBodyScroll(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawSource = file ?? blob ?? url ?? null;

  useEffect(() => {
    if (!open) {
      setSourceUrl(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (!rawSource) {
      setSourceUrl(null);
      setLoading(false);
      return;
    }

    if (typeof rawSource === "string") {
      setSourceUrl(rawSource);
      return;
    }

    if (
      typeof Blob !== "undefined" &&
      rawSource instanceof Blob
    ) {
      const objectUrl = URL.createObjectURL(rawSource);
      setSourceUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    setSourceUrl(null);
    setLoading(false);
  }, [open, rawSource]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Fallback timer to hide spinner if iframe/browser PDF plugin does not fire onLoad
  useEffect(() => {
    if (!open || !loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [open, loading]);

  if (!open || !mounted || typeof document === "undefined") return null;

  const modalContent = (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`modal pdf-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={dialogRef}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Zatvori"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="pdf-modal-container">
            {loading && (
              <div className="pdf-modal-loading">
                <div className="pdf-modal-spinner" />
                <span>Učitavanje dokumenta...</span>
              </div>
            )}

            {sourceUrl ? (
              <iframe
                src={sourceUrl}
                title={title}
                className="pdf-modal-frame"
                onLoad={() => setLoading(false)}
              />
            ) : (
              <div className="pdf-modal-empty">
                <p>Nema odabranog dokumenta za prikaz.</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-secondary"
            onClick={onClose}
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}