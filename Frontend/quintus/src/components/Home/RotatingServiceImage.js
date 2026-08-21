"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

function normalizeUrls(imageUrls) {
  return Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : [];
}

function findAvailableIndex(urls, startIndex, failedSources) {
  for (let step = 0; step < urls.length; step++) {
    const candidateIndex = (startIndex + step) % urls.length;
    const candidateSrc = urls[candidateIndex];
    if (candidateSrc && !failedSources.has(candidateSrc)) return candidateIndex;
  }

  return 0;
}

export default function RotatingServiceImage({
  imageUrls = [],
  alt,
  rotationStep = 0,
  fadeMs = 900,
  isEditing = false,
  onRemoveImage,
}) {
  const urls = useMemo(() => normalizeUrls(imageUrls), [imageUrls]);
  const urlsKey = useMemo(() => urls.join("|"), [urls]);
  const [index, setIndex] = useState(0);
  const [previousSrc, setPreviousSrc] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const failedSrcRef = useRef(new Set());
  const fadeTimerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Reset the transition when the service gallery changes.
    setIndex(0);
    setPreviousSrc(null);
    setIsTransitioning(false);
    failedSrcRef.current = new Set();
  }, [urlsKey]);

  useEffect(() => {
    const target = containerRef.current;
    if (!target || !("IntersectionObserver" in window)) {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(Boolean(entry?.isIntersecting)),
      { rootMargin: "160px 0px", threshold: 0.01 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isNearViewport || urls.length <= 1) return;

    const nextIndex = findAvailableIndex(
      urls,
      rotationStep % urls.length,
      failedSrcRef.current
    );

    setIndex((currentIndex) => {
      if (currentIndex === nextIndex) return currentIndex;
      setPreviousSrc(urls[currentIndex] || null);
      setIsTransitioning(false);
      return nextIndex;
    });
  }, [isNearViewport, rotationStep, urls]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const currentSrc = urls[index] || null;

  if (!currentSrc) return null;

  const handleImageError = (failedSrc, failedIndex) => {
    if (failedSrc) failedSrcRef.current?.add(failedSrc);

    setIndex((i) => {
      if (i !== failedIndex) return i;
      return findAvailableIndex(urls, i + 1, failedSrcRef.current);
    });
  };

  const beginTransition = () => {
    if (!previousSrc) return;

    window.requestAnimationFrame(() => {
      setIsTransitioning(true);
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = window.setTimeout(() => {
        setPreviousSrc(null);
        setIsTransitioning(false);
      }, Math.max(0, Number(fadeMs) || 0));
    });
  };

  return (
    <div
      ref={containerRef}
      className={`rotating-service-image${isEditing ? " is-editing" : ""}`}
      style={{ "--rs-fade-ms": `${Math.max(0, Number(fadeMs) || 0)}ms` }}
    >
      {previousSrc ? (
        <Image
          src={previousSrc}
          alt=""
          fill
          aria-hidden="true"
          sizes="(max-width: 600px) 92vw, (max-width: 992px) 45vw, 360px"
          className={`rotating-service-image-img ${isTransitioning ? "is-next" : "is-current"}`}
        />
      ) : null}
      <Image
        src={currentSrc}
        alt={alt || ""}
        fill
        sizes="(max-width: 600px) 92vw, (max-width: 992px) 45vw, 360px"
        priority={false}
        loading="lazy"
        className={`rotating-service-image-img ${previousSrc && !isTransitioning ? "is-next" : "is-current"}`}
        onLoad={beginTransition}
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
