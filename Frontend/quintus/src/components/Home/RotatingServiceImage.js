"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

function normalizeUrls(imageUrls) {
  return Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : [];
}

function isLocalUrl(url) {
  return typeof url === "string" && url.startsWith("/");
}

function passthroughLoader({ src }) {
  return src;
}

export default function RotatingServiceImage({
  imageUrls = [],
  alt,
  intervalMs = 4500,
  fadeMs = 900,
  isEditing = false,
  onRemoveImage,
}) {
  const urls = useMemo(() => normalizeUrls(imageUrls), [imageUrls]);
  const urlsKey = useMemo(() => urls.join("|"), [urls]);
  const urlsRef = useRef(urls);
  const [index, setIndex] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(null);
  const [nextSrc, setNextSrc] = useState(null);
  const [isFading, setIsFading] = useState(false);
  const fadeTimerRef = useRef(null);
  const nextLoadTimeoutRef = useRef(null);
  const nextSrcRef = useRef(null);
  const isFadingRef = useRef(false);
  const failedSrcRef = useRef(new Set());

  useEffect(() => {
    urlsRef.current = urls;
  }, [urls]);

  useEffect(() => {
    setIndex(0);
    setIsFading(false);
    setNextSrc(null);
    setCurrentSrc((prev) => {
      const first = urlsRef.current[0] || null;
      return prev === first ? prev : first;
    });
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (nextLoadTimeoutRef.current) {
      clearTimeout(nextLoadTimeoutRef.current);
      nextLoadTimeoutRef.current = null;
    }
    nextSrcRef.current = null;
    isFadingRef.current = false;
    failedSrcRef.current = new Set();
  }, [urlsKey]);

  useEffect(() => {
    if (urlsRef.current.length <= 1) return;

    const id = setInterval(() => {
      // Buffer rotation: do not advance while we're loading/fading the next image.
      if (nextSrcRef.current || isFadingRef.current) return;

      setIndex((i) => {
        const list = urlsRef.current;
        if (list.length <= 1) return i;

        // Advance to next non-failed url (best effort)
        const failed = failedSrcRef.current;
        for (let step = 1; step <= list.length; step++) {
          const candidateIndex = (i + step) % list.length;
          const candidateSrc = list[candidateIndex];
          if (!candidateSrc) continue;
          if (!failed?.has(candidateSrc)) return candidateIndex;
        }
        return i;
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [urlsKey, intervalMs]);

  // Keep currentSrc in sync with index, but don't switch visually until the next image loads.
  useEffect(() => {
    const desired = urls[index] || null;
    if (!desired) return;

    // First render / url list changed
    if (!currentSrc) {
      setCurrentSrc(desired);
      return;
    }

    // No-op
    if (desired === currentSrc || desired === nextSrc) return;

    // Prepare next image (will fade in once it's loaded)
    setNextSrc(desired);
    setIsFading(false);
  }, [index, urlsKey, urls, currentSrc, nextSrc]);

  useEffect(() => {
    if (!nextSrc) return;
    // Safety: if the next image never loads, don't get stuck.
    if (nextLoadTimeoutRef.current) clearTimeout(nextLoadTimeoutRef.current);
    nextLoadTimeoutRef.current = setTimeout(() => {
      // Mark as failed and move on.
      failedSrcRef.current?.add(nextSrc);
      setNextSrc(null);
      setIsFading(false);
      nextLoadTimeoutRef.current = null;
      setIndex((i) => {
        const len = urlsRef.current.length;
        return len ? (i + 1) % len : i;
      });
    }, 8000);

    return () => {
      if (nextLoadTimeoutRef.current) {
        clearTimeout(nextLoadTimeoutRef.current);
        nextLoadTimeoutRef.current = null;
      }
    };
  }, [nextSrc, urlsKey]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (nextLoadTimeoutRef.current) clearTimeout(nextLoadTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    nextSrcRef.current = nextSrc;
  }, [nextSrc]);

  useEffect(() => {
    isFadingRef.current = isFading;
  }, [isFading]);

  const localCurrent = isLocalUrl(currentSrc);
  const localNext = isLocalUrl(nextSrc);

  if (!currentSrc) return null;

  const finishFade = () => {
    const ms = Math.max(0, Number(fadeMs) || 0);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => {
      setCurrentSrc(nextSrc);
      setNextSrc(null);
      setIsFading(false);
      fadeTimerRef.current = null;
    }, ms);
  };

  const cancelNextWithFallback = (failedSrc) => {
    if (failedSrc) failedSrcRef.current?.add(failedSrc);
    setNextSrc(null);
    setIsFading(false);
    if (nextLoadTimeoutRef.current) {
      clearTimeout(nextLoadTimeoutRef.current);
      nextLoadTimeoutRef.current = null;
    }

    // Move index forward so we can try another image next tick.
    setIndex((i) => (urls.length ? (i + 1) % urls.length : i));
  };

  return (
    <div
      className={`rotating-service-image${isFading ? " is-fading" : ""}${isEditing ? " is-editing" : ""}`}
      style={{ "--rs-fade-ms": `${Math.max(0, Number(fadeMs) || 0)}ms` }}
    >
      <Image
        src={currentSrc}
        alt={alt || ""}
        fill
        sizes="(max-width: 600px) 92vw, (max-width: 992px) 45vw, 360px"
        priority={false}
        className="rotating-service-image-img is-current"
        loader={localCurrent ? undefined : passthroughLoader}
        unoptimized={!localCurrent}
      />

      {nextSrc ? (
        <Image
          src={nextSrc}
          alt={alt || ""}
          fill
          sizes="(max-width: 600px) 92vw, (max-width: 992px) 45vw, 360px"
          priority={false}
          className="rotating-service-image-img is-next"
          loader={localNext ? undefined : passthroughLoader}
          unoptimized={!localNext}
          onLoad={() => {
            // Start fading only after the next image has rendered.
            setIsFading(true);

            if (nextLoadTimeoutRef.current) {
              clearTimeout(nextLoadTimeoutRef.current);
              nextLoadTimeoutRef.current = null;
            }
            finishFade();
          }}
          onError={() => cancelNextWithFallback(nextSrc)}
        />
      ) : null}

      {isEditing && currentSrc && onRemoveImage ? (
        <button
          type="button"
          className="image-remove-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveImage(currentSrc);
          }}
          aria-label="Ukloni sliku"
          title="Klikni za brisanje slike"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
