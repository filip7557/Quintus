"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

function passthroughLoader({ src }) {
  return src;
}

function normalizeUrls(imageUrls) {
  return Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : [];
}

function pickFirstNonEmpty(values, fallback = "") {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return fallback;
}

export default function ServiceDetailsModal({ service, open, onClose }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeImage, setActiveImage] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activePointerId, setActivePointerId] = useState(null);
  const lightboxContentRef = useRef(null);
  const lightboxImageRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const imageUrls = useMemo(
    () => normalizeUrls(service?.ImageUrls ?? service?.imageUrls ?? []),
    [service]
  );

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;

    setSelectedImageIndex(0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (activeImage) {
          setActiveImage("");
          setZoomLevel(1);
          setPan({ x: 0, y: 0 });
          setIsDragging(false);
          setActivePointerId(null);
          return;
        }
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, activeImage]);

  const closeLightbox = () => {
    setActiveImage("");
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
    setActivePointerId(null);
  };

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(3, Number((prev + 0.25).toFixed(2))));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const getPanLimits = () => {
    const contentEl = lightboxContentRef.current;
    const imageEl = lightboxImageRef.current;

    if (!contentEl || !imageEl || zoomLevel <= 1) {
      return { maxX: 0, maxY: 0 };
    }

    const contentW = contentEl.clientWidth;
    const contentH = contentEl.clientHeight;
    const imageW = imageEl.clientWidth;
    const imageH = imageEl.clientHeight;
    const scaledW = imageW * zoomLevel;
    const scaledH = imageH * zoomLevel;

    return {
      maxX: Math.max(0, (scaledW - contentW) / 2),
      maxY: Math.max(0, (scaledH - contentH) / 2),
    };
  };

  const clampPan = (x, y) => {
    const { maxX, maxY } = getPanLimits();
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  const handleImagePointerDown = (event) => {
    if (zoomLevel <= 1) return;

    event.preventDefault();
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    setIsDragging(true);
    setActivePointerId(event.pointerId);
  };

  useEffect(() => {
    if (!isDragging || zoomLevel <= 1) return;

    const handlePointerMove = (event) => {
      if (activePointerId !== null && event.pointerId !== activePointerId) return;

      const deltaX = event.clientX - dragStartRef.current.x;
      const deltaY = event.clientY - dragStartRef.current.y;
      const next = clampPan(
        dragStartRef.current.panX + deltaX,
        dragStartRef.current.panY + deltaY
      );
      setPan(next);
    };

    const handlePointerUp = (event) => {
      if (activePointerId !== null && event.pointerId !== activePointerId) return;
      setIsDragging(false);
      setActivePointerId(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging, zoomLevel, activePointerId]);

  useEffect(() => {
    if (!activeImage) return;

    if (zoomLevel <= 1) {
      setPan({ x: 0, y: 0 });
      return;
    }

    setPan((prev) => clampPan(prev.x, prev.y));
  }, [zoomLevel, activeImage]);

  useEffect(() => {
    if (!activeImage) return;

    const onResize = () => {
      setPan((prev) => clampPan(prev.x, prev.y));
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [activeImage, zoomLevel]);

  if (!open || !service) return null;

  const title = pickFirstNonEmpty(
    [
      service?.Title,
      service?.title,
      service?.Name,
      service?.name,
      service?.ServiceName,
      service?.serviceName,
    ],
    "Usluga"
  );
  const description = pickFirstNonEmpty(
    [service?.Description, service?.description],
    ""
  );
  const keywords = service?.KeyWords ?? service?.keyWords ?? service?.keywords ?? [];
  const selectedImage = imageUrls[selectedImageIndex] ?? imageUrls[0] ?? null;

  return (
    <div
      className="modal-overlay service-details-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className="modal service-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-details-title"
      >
        {activeImage ? (
          <div
            className="service-lightbox-overlay"
            onClick={closeLightbox}
            role="presentation"
          >
            <div
              className="service-lightbox-content"
              ref={lightboxContentRef}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Prikaz slike usluge"
            >
              <button
                type="button"
                className="service-lightbox-close"
                onClick={closeLightbox}
                aria-label="Zatvori prikaz slike"
              >
                ×
              </button>

              <div className="service-lightbox-controls">
                <button
                  type="button"
                  className="service-lightbox-control-btn"
                  onClick={zoomOut}
                  aria-label="Umanji"
                >
                  -
                </button>
                <button
                  type="button"
                  className="service-lightbox-control-btn"
                  onClick={resetZoom}
                  aria-label="Resetiraj zum"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  className="service-lightbox-control-btn"
                  onClick={zoomIn}
                  aria-label="Uvećaj"
                >
                  +
                </button>
              </div>

              <img
                src={activeImage}
                alt="Uvećani prikaz usluge"
                className={`service-lightbox-image ${zoomLevel > 1 ? "is-zoomed" : ""} ${
                  isDragging ? "is-dragging" : ""
                }`}
                ref={lightboxImageRef}
                onPointerDown={handleImagePointerDown}
                style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomLevel})` }}
              />
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className="modal-close service-details-close"
          onClick={onClose}
          aria-label="Zatvori detalje usluge"
        >
          ×
        </button>

        <h3 id="service-details-title" className="service-details-title">
            {title}
        </h3>

        <div className="modal-body service-details-body">
          {selectedImage ? (
            <div className="service-details-featured-image">
              <Image
                src={selectedImage}
                alt={title}
                fill
                sizes="(max-width: 768px) 92vw, 760px"
                style={{ objectFit: "cover" }}
                loader={passthroughLoader}
                unoptimized
              />
            </div>
          ) : null}

          <div className="service-details-content">
            <p className="service-description service-details-text">{description}</p>

            {Array.isArray(keywords) && keywords.length ? (
              <div className="service-details-keywords" aria-label="Ključne riječi usluge">
                {keywords.map((keyword, index) => (
                  <span key={`${keyword}:${index}`} className="service-details-keyword">
                    {keyword}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {imageUrls.length ? (
            <div className="service-details-gallery" aria-label="Galerija slika usluge">
              {imageUrls.map((src, idx) => (
                <button
                  key={`${src}:${idx}`}
                  type="button"
                  className={`service-details-thumb${idx === selectedImageIndex ? " is-active" : ""}`}
                  onClick={() => {
                    setSelectedImageIndex(idx);
                    setActiveImage(src);
                    setZoomLevel(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  aria-label={`Prikaži sliku ${idx + 1}`}
                >
                  <Image
                    src={src}
                    alt={`${title} ${idx + 1}`}
                    fill
                    sizes="156px"
                    style={{ objectFit: "cover" }}
                    loader={passthroughLoader}
                    unoptimized
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
