"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

function passthroughLoader({ src }) {
  return src;
}

export default function ImageRemovalModal({
  open,
  onClose,
  onConfirm,
  onCancel,
  imageUrl,
  serviceName = "Usluga",
}) {
  const [confirming, setConfirming] = useState(false);
  const dialogRef = useRef(null);
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (confirming) return;
        onCancel?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel, confirming]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm?.();
    } finally {
      setConfirming(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (confirming) return;
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" ref={dialogRef}>
        <div className="modal-header">
          <h3>Potvrdite brisanje slike</h3>
          <button
            type="button"
            className="modal-close"
            onClick={() => {
              if (confirming) return;
              onCancel?.();
            }}
            aria-label="Zatvori"
            disabled={confirming}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <p>Jeste li sigurni da želite obrisati ovu sliku iz usluge &quot;{serviceName}&quot;?</p>

          {imageUrl ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "200px",
                marginTop: "1rem",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <Image
                src={imageUrl}
                alt="Slika za brisanje"
                fill
                sizes="300px"
                style={{ objectFit: "cover" }}
                loader={passthroughLoader}
                unoptimized
              />
            </div>
          ) : null}

          <p style={{ marginTop: "1rem", color: "#999", fontSize: "0.9rem" }}>
            Ova radnja se ne može vratiti.
          </p>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-secondary"
            onClick={() => {
              if (confirming) return;
              onCancel?.();
            }}
            disabled={confirming}
          >
            Odustani
          </button>
          <button
            type="button"
            className="modal-danger"
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming ? "Brisanje..." : "Obriši sliku"}
          </button>
        </div>
      </div>
    </div>
  );
}
