"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NavBar from "@/components/NavBar/NavBar";
import { getRequestById } from "@/services/requestService";
import styles from "./page.module.css";

function pickField(obj, keys, fallback = "") {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
}

function formatDate(dateValue) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeImageUrls(request) {
  const direct = Array.isArray(request?.ImageUrls)
    ? request.ImageUrls
    : Array.isArray(request?.imageUrls)
      ? request.imageUrls
      : [];

  const fromImages = Array.isArray(request?.Images)
    ? request.Images
    : Array.isArray(request?.images)
      ? request.images
      : [];

  const mapped = fromImages
    .map((img) =>
      pickField(
        img,
        ["Url", "url", "ImageUrl", "imageUrl", "Path", "path"],
        ""
      )
    )
    .filter(Boolean);

  return [...direct, ...mapped].filter(Boolean);
}

export default function RequestDetailsClient({ requestId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [request, setRequest] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activePointerId, setActivePointerId] = useState(null);
  const lightboxContentRef = useRef(null);
  const lightboxImageRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const resolvedId = useMemo(() => String(requestId ?? "").trim(), [requestId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!resolvedId) {
        setError("Nedostaje ID zahtjeva.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const response = await getRequestById(resolvedId);
      if (cancelled) return;

      if (response?.status >= 200 && response?.status < 300 && response?.data) {
        setRequest(response.data);
      } else {
        setError(response?.data?.message || "Greška pri dohvaćanju zahtjeva.");
      }

      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [resolvedId]);

  useEffect(() => {
    if (!activeImage) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveImage("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeImage]);

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

  const getPanLimits = useCallback(() => {
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
  }, [zoomLevel]);

  const clampPan = useCallback((x, y) => {
    const { maxX, maxY } = getPanLimits();
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }, [getPanLimits]);

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
  }, [isDragging, zoomLevel, activePointerId, clampPan]);

  useEffect(() => {
    if (!activeImage) return;

    if (zoomLevel <= 1) {
      setPan({ x: 0, y: 0 });
      return;
    }

    setPan((prev) => clampPan(prev.x, prev.y));
  }, [zoomLevel, activeImage, clampPan]);

  useEffect(() => {
    if (!activeImage) return;

    const onResize = () => {
      setPan((prev) => clampPan(prev.x, prev.y));
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [activeImage, zoomLevel, clampPan]);

  const title = useMemo(() => pickField(request, ["Title", "title"], "—"), [request]);
  const description = useMemo(
    () => pickField(request, ["Description", "description"], "—"),
    [request]
  );
  const createdAt = useMemo(
    () => pickField(request, ["CreatedAt", "createdAt", "Date", "date"], ""),
    [request]
  );

  const requesterName = useMemo(
    () => {
      const requestedBy = request?.RequestedBy ?? request?.requestedBy ?? null;
      const fullName = [
        pickField(requestedBy, ["FirstName", "firstName"], ""),
        pickField(requestedBy, ["LastName", "lastName"], ""),
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (fullName) return fullName;

      return pickField(
        requestedBy,
        ["UserName", "userName", "Name", "name", "DisplayName", "displayName"],
        "—"
      );
    },
    [request]
  );
  const requesterEmail = useMemo(
    () => {
      const requestedBy = request?.RequestedBy ?? request?.requestedBy ?? null;
      return pickField(
        requestedBy,
        ["Email", "email", "UserEmail", "userEmail", "RequesterEmail", "requesterEmail"],
        "—"
      );
    },
    [request]
  );
  const requesterPhone = useMemo(
    () => {
      const requestedBy = request?.RequestedBy ?? request?.requestedBy ?? null;
      return pickField(
        requestedBy,
        ["Phone", "phone", "PhoneNumber", "phoneNumber", "Mobile", "mobile"],
        "—"
      );
    },
    [request]
  );

  const imageUrls = useMemo(() => normalizeImageUrls(request), [request]);

  return (
    <>
      {!activeImage ? <NavBar /> : null}
      <main className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Detalji zahtjeva</h1>
            </div>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => router.push("/requests")}
            >
              Natrag na zahtjeve
            </button>
          </div>

          {loading ? <div className={styles.notice}>Učitavanje...</div> : null}
          {!loading && error ? <div className={styles.errorMessage}>{error}</div> : null}

          {!loading && !error && request ? (
            <>
              <div className={styles.infoGrid}>
                <div className={styles.infoField}>
                  <span className={styles.label}>Naslov</span>
                  <div className={styles.value}>{title}</div>
                </div>
                <div className={styles.infoField}>
                  <span className={styles.label}>Datum</span>
                  <div className={styles.value}>{formatDate(createdAt)}</div>
                </div>
                <div className={styles.infoField}>
                  <span className={styles.label}>Broj slika</span>
                  <div className={styles.value}>{imageUrls.length}</div>
                </div>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoField}>
                  <span className={styles.label}>Korisnik</span>
                  <div className={styles.value}>{requesterName}</div>
                </div>
                <div className={styles.infoField}>
                  <span className={styles.label}>Email</span>
                  <div className={styles.value}>{requesterEmail}</div>
                </div>
                <div className={styles.infoField}>
                  <span className={styles.label}>Telefon</span>
                  <div className={styles.value}>{requesterPhone}</div>
                </div>
              </div>

              <div className={styles.descriptionBlock}>
                <span className={styles.label}>Opis zahtjeva</span>
                <p className={styles.descriptionText}>{description || "—"}</p>
              </div>

              {imageUrls.length > 0 ? (
                <div className={styles.imagesBlock}>
                  <span className={styles.label}>Priložene slike</span>
                  <div className={styles.imageGrid}>
                    {imageUrls.map((url, idx) => (
                      <button
                        type="button"
                        key={`${url}-${idx}`}
                        className={styles.imageButton}
                        onClick={() => {
                          setActiveImage(url);
                          setZoomLevel(1);
                        }}
                        aria-label={`Prikaži sliku ${idx + 1}`}
                      >
                        <Image
                          src={url}
                          alt={`Prilog ${idx + 1}`}
                          className={styles.imageThumb}
                          width={800}
                          height={600}
                          loader={({ src }) => src}
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.emptyMessage}>Zahtjev nema priloženih slika.</div>
              )}
            </>
          ) : null}
        </div>

        {activeImage ? (
          <div
            className={styles.lightboxOverlay}
            onClick={closeLightbox}
            role="presentation"
          >
            <div
              className={styles.lightboxContent}
              ref={lightboxContentRef}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Prikaz slike"
            >
              <div className={styles.lightboxControls}>
                <button
                  type="button"
                  className={styles.lightboxControlBtn}
                  onClick={zoomOut}
                  aria-label="Umanji"
                >
                  -
                </button>
                <button
                  type="button"
                  className={styles.lightboxControlBtn}
                  onClick={resetZoom}
                  aria-label="Resetiraj zum"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  className={styles.lightboxControlBtn}
                  onClick={zoomIn}
                  aria-label="Uvećaj"
                >
                  +
                </button>
              </div>
              <Image
                src={activeImage}
                alt="Uvećani prikaz priloga"
                className={`${styles.lightboxImage} ${zoomLevel > 1 ? styles.lightboxImageZoomed : ""} ${
                  isDragging ? styles.lightboxImageDragging : ""
                }`}
                width={1600}
                height={1200}
                loader={({ src }) => src}
                unoptimized
                ref={lightboxImageRef}
                onPointerDown={handleImagePointerDown}
                style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomLevel})` }}
              />
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
