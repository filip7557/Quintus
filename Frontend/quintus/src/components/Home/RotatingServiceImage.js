"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useId, useMemo, useRef, useState } from "react";
import { useServiceRotation } from "./ServiceRotationProvider";

function normalizeUrls(imageUrls) {
  return Array.isArray(imageUrls) ? [...new Set(imageUrls.filter(Boolean))] : [];
}

function findAvailableIndex(urls, startIndex, failedSources) {
  for (let step = 0; step < urls.length; step++) {
    const candidateIndex = (startIndex + step) % urls.length;
    const candidateSrc = urls[candidateIndex];
    if (candidateSrc && !failedSources.has(candidateSrc)) return candidateIndex;
  }

  return -1;
}

export default function RotatingServiceImage({ imageUrls = [], ...props }) {
  const urls = useMemo(() => normalizeUrls(imageUrls), [imageUrls]);
  return <ServiceImageRotation key={JSON.stringify(urls)} urls={urls} {...props} />;
}

function ServiceImageRotation({
  urls,
  alt,
  intervalMs = 4500,
  fadeMs = 900,
  isEditing = false,
  onRemoveImage,
}) {
  const [index, setIndex] = useState(0);
  const [previousSrc, setPreviousSrc] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const failedSrcRef = useRef(new Set());
  const containerRef = useRef(null);
  const currentSrc = urls[index] || null;
  const transitionMs = Math.max(0, Number(fadeMs) || 0);
  const rotation = useServiceRotation();
  const rotationId = useId();

  const advance = useEffectEvent(() => {
    const nextIndex = findAvailableIndex(urls, index + 1, failedSrcRef.current);
    if (nextIndex < 0 || nextIndex === index) return false;
    setPreviousSrc(currentSrc);
    setLoadedSrc(null);
    setIsTransitioning(false);
    setIndex(nextIndex);
    return true;
  });
  const fade = useEffectEvent(() => {
    if (previousSrc) setIsTransitioning(true);
  });
  const finish = useEffectEvent(() => {
    setPreviousSrc(null);
    setIsTransitioning(false);
  });

  useEffect(() => {
    if (!rotation) return;
    return rotation.register(rotationId, {
      advance: () => advance(),
      fade: () => fade(),
      finish: () => finish(),
    });
  }, [rotation, rotationId]);

  useEffect(() => {
    rotation?.update(
      rotationId,
      isNearViewport && urls.length > 1 && Boolean(currentSrc) && !isEditing,
      loadedSrc === currentSrc
    );
  }, [rotation, rotationId, isNearViewport, urls.length, currentSrc, loadedSrc, isEditing]);

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
    if (rotation || !isNearViewport || urls.length <= 1 || !currentSrc ||
        loadedSrc !== currentSrc || previousSrc || isEditing) return;

    const timer = window.setTimeout(() => {
      advance();
    }, Math.max(0, Number(intervalMs) || 0));

    return () => window.clearTimeout(timer);
  }, [rotation, isNearViewport, urls, index, currentSrc, loadedSrc, previousSrc, intervalMs, isEditing]);

  useEffect(() => {
    if (rotation || !isTransitioning || !previousSrc) return;
    const timer = window.setTimeout(() => {
      setPreviousSrc(null);
      setIsTransitioning(false);
    }, transitionMs);
    return () => window.clearTimeout(timer);
  }, [rotation, isTransitioning, previousSrc, transitionMs]);

  const handleImageError = (failedSrc, failedIndex) => {
    console.error("[RotatingServiceImage] Failed to load service image:", failedSrc);
    failedSrcRef.current.add(failedSrc);
    if (index !== failedIndex) return;
    const nextIndex = findAvailableIndex(urls, index + 1, failedSrcRef.current);
    if (urls[nextIndex] === previousSrc || nextIndex < 0) setPreviousSrc(null);
    setLoadedSrc(null);
    setIsTransitioning(false);
    setIndex(nextIndex);
  };

  const beginTransition = () => {
    setLoadedSrc(currentSrc);
    if (previousSrc && !rotation) setIsTransitioning(true);
  };

  if (!urls.length) return null;

  return (
    <div
      ref={containerRef}
      className={`rotating-service-image${isEditing ? " is-editing" : ""}`}
      style={{ "--rs-fade-ms": `${transitionMs}ms` }}
    >
      {previousSrc ? (
        <Image
          key={`previous:${previousSrc}`}
          src={previousSrc}
          alt=""
          fill
          aria-hidden="true"
          loading={isNearViewport ? "eager" : "lazy"}
          sizes="(max-width: 600px) min(92vw, 380px), (max-width: 900px) 46vw, (max-width: 1140px) 23vw, 263px"
          className={`rotating-service-image-img ${isTransitioning ? "is-next" : "is-current"}`}
        />
      ) : null}
      {currentSrc ? <Image
        key={`current:${currentSrc}`}
        src={currentSrc}
        alt={alt || ""}
        fill
        sizes="(max-width: 600px) min(92vw, 380px), (max-width: 900px) 46vw, (max-width: 1140px) 23vw, 263px"
        loading={isNearViewport ? "eager" : "lazy"}
        className={`rotating-service-image-img ${previousSrc && !isTransitioning ? "is-next" : "is-current"}`}
        onLoad={beginTransition}
        onError={() => handleImageError(currentSrc, index)}
      /> : <span role="status">Slika nije dostupna.</span>}

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
