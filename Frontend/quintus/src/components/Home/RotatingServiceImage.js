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
  const [index, setIndex] = useState(0);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const failedSrcRef = useRef(new Set());
  const containerRef = useRef(null);

  useEffect(() => {
    // Reset component state when the image list changes.
    setIndex(0);
    failedSrcRef.current = new Set();
  }, [urlsKey]);

  useEffect(() => {
    if (urls.length <= 1) return;

    const id = setInterval(() => {
      setIndex((i) => {
        if (urls.length <= 1) return i;

        const failed = failedSrcRef.current;
        for (let step = 1; step <= urls.length; step++) {
          const candidateIndex = (i + step) % urls.length;
          const candidateSrc = urls[candidateIndex];
          if (!candidateSrc) continue;
          if (!failed?.has(candidateSrc)) return candidateIndex;
        }
        return i;
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [urls, intervalMs]);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    if (!("IntersectionObserver" in window)) {
      // Fallback for older browsers: keep preloading behavior enabled.
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsNearViewport(Boolean(entry?.isIntersecting));
      },
      {
        // Start preloading shortly before the card enters viewport.
        root: null,
        rootMargin: "220px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (urls.length <= 1 || !isNearViewport) return;

    const nextIndex = (index + 1) % urls.length;
    const nextSrc = urls[nextIndex];
    if (!nextSrc || failedSrcRef.current?.has(nextSrc)) return;

    // Preload only the upcoming image to avoid downloading full galleries at once.
    const preloader = new window.Image();
    preloader.src = nextSrc;
  }, [index, urls, isNearViewport]);

  const currentSrc = urls[index] || null;

  if (!currentSrc) return null;

  const handleImageError = (failedSrc, failedIndex) => {
    if (failedSrc) failedSrcRef.current?.add(failedSrc);

    setIndex((i) => {
      if (i !== failedIndex) return i;
      for (let step = 1; step <= urls.length; step++) {
        const candidateIndex = (i + step) % urls.length;
        const candidateSrc = urls[candidateIndex];
        if (!candidateSrc) continue;
        if (!failedSrcRef.current?.has(candidateSrc)) return candidateIndex;
      }
      return i;
    });
  };

  return (
    <div
      ref={containerRef}
      className={`rotating-service-image${isEditing ? " is-editing" : ""}`}
      style={{ "--rs-fade-ms": `${Math.max(0, Number(fadeMs) || 0)}ms` }}
    >
      <Image
        key={currentSrc}
        src={currentSrc}
        alt={alt || ""}
        fill
        sizes="(max-width: 600px) 92vw, (max-width: 992px) 45vw, 360px"
        priority={false}
        loading="lazy"
        className="rotating-service-image-img is-current"
        loader={isLocalUrl(currentSrc) ? undefined : passthroughLoader}
        unoptimized={!isLocalUrl(currentSrc)}
        onError={() => handleImageError(currentSrc, index)}
      />

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
