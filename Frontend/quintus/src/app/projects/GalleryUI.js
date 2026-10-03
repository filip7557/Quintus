"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import styles from "./page.module.css";

export function GalleryDialog({ title, children, onClose, busy = false, wide = false }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    (element.querySelector("input, textarea") || element.querySelector("button"))?.focus();
    return () => { element.close(); previous?.focus?.(); };
  }, []);
  return <dialog ref={dialog} className={`${styles.dialog} ${wide ? styles.viewerDialog : ""}`}
    aria-labelledby={titleId} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); if (!busy) onClose(); } }}>
    <div className={styles.dialogHeader}>
      <h2 id={titleId}>{title}</h2>
      <button type="button" className={styles.iconBtn} onClick={onClose} disabled={busy} title="Zatvori" aria-label="Zatvori"><X size={20} /></button>
    </div>
    {children}
  </dialog>;
}

export function GalleryImage({ src, alt, contain = false, loading = "lazy" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={styles.imageFallback}><ImageOff size={30} /><span>{src ? "Slika nije dostupna" : "Bez fotografija"}</span></div>;
  return <Image src={src} alt={alt} fill unoptimized sizes="(max-width: 600px) 100vw, (max-width: 920px) 50vw, 33vw"
    className={contain ? styles.containedImage : styles.coverImage} onError={() => setFailed(true)} loading={loading} />;
}

export function Pagination({ data, onChange, disabled = false }) {
  if (!data || data.totalPages < 2) return null;
  return <nav className={styles.pagination} aria-label="Stranice galerije">
    <button type="button" className={styles.iconBtn} disabled={disabled || data.page <= 1} onClick={() => onChange(data.page - 1)} title="Prethodna stranica" aria-label="Prethodna stranica"><ChevronLeft size={20} /></button>
    <span>Stranica {data.page} od {data.totalPages}</span>
    <button type="button" className={styles.iconBtn} disabled={disabled || data.page >= data.totalPages} onClick={() => onChange(data.page + 1)} title="Sljedeća stranica" aria-label="Sljedeća stranica"><ChevronRight size={20} /></button>
  </nav>;
}