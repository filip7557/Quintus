"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import NavBar from "@/components/NavBar/NavBar";
import { createRequest } from "@/services/requestService";
import { getCurrentUser } from "@/services/authService";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let fileEntryId = 0;
function makeFileEntry(file) {
  return { id: ++fileEntryId, file, previewUrl: URL.createObjectURL(file) };
}

export default function CreateRequestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileEntries, setFileEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getCurrentUser();
        if (result?.data) {
          setIsAuthenticated(true);
        } else {
          router.push("/auth?from=/create-request");
        }
      } catch (e) {
        router.push("/auth?from=/create-request");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleImageChange = (e) => {
    const newEntries = e.target.files
      ? Array.from(e.target.files).map(makeFileEntry)
      : [];
    setFileEntries((prev) => [...prev, ...newEntries]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id) => {
    setFileEntries((prev) => {
      const removed = prev.find((entry) => entry.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((entry) => entry.id !== id);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const images = fileEntries.map((entry) => entry.file);
      const response = await createRequest(title, description, images);

      if (response?.status === 200 || response?.status === 201) {
        setSuccess(true);
        setTitle("");
        setDescription("");
        setFileEntries((prev) => {
          prev.forEach((entry) => URL.revokeObjectURL(entry.previewUrl));
          return [];
        });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response?.data?.message || "Greška pri slanju zahtjeva.");
      }
    } catch (err) {
      setError("Greška pri slanju zahtjeva. Pokušajte ponovno.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = title.trim().length > 0 && description.trim().length > 0;

  return (
    <>
      <NavBar />
      <main className={styles.container}>
        {isCheckingAuth ? (
          <div className={styles.requestCard}>
            <div className={styles.loadingMessage}>Provjera autentičnosti...</div>
          </div>
        ) : isAuthenticated ? (
          <div className={styles.requestCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>Kreiraj novi zahtjev</h1>
            <p className={styles.subtitle}>
              Popunite obrazac i pošaljite nam detaljno opisan zahtjev.
            </p>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && (
            <div className={styles.successMessage}>
              Zahtjev je uspješno poslаn!
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Naslov zahtjeva *</label>
              <input
                id="title"
                type="text"
                placeholder="Kratko opišite problem"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
              <span className={styles.charCount}>
                {title.length}/100
              </span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Opis zahtjeva *</label>
              <textarea
                id="description"
                placeholder="Detaljno opišite problem ili zahtjev"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={6}
                required
              />
              <span className={styles.charCount}>
                {description.length}/500
              </span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="images">Fotografije (opcionalno)</label>
              <label className={styles.fileDropZone} htmlFor="images">
                <span className={styles.fileDropIcon}>📎</span>
                <span className={styles.fileDropText}>
                  Kliknite ili povucite fotografije ovdje
                </span>
                <span className={styles.fileDropHint}>
                  PNG, JPG, WEBP · max 5 MB po slici
                </span>
                <input
                  ref={fileInputRef}
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInputHidden}
                />
              </label>

              {fileEntries.length > 0 && (
                <div className={styles.fileCardGrid}>
                  {fileEntries.map(({ id, file, previewUrl }) => (
                    <div key={id} className={styles.fileCard}>
                      <div className={styles.fileCardThumb}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className={styles.fileCardImg}
                        />
                      </div>
                      <div className={styles.fileCardInfo}>
                        <span className={styles.fileCardName} title={file.name}>
                          {file.name}
                        </span>
                        <span className={styles.fileCardSize}>
                          {formatBytes(file.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={styles.fileCardRemove}
                        onClick={() => removeImage(id)}
                        aria-label={`Ukloni ${file.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!isFormValid || loading}
            >
              {loading ? "Slanje..." : "Pošalji zahtjev"}
            </button>

            <button
              type="button"
              className={styles.backBtn}
              onClick={() => router.push("/")}
            >
              Natrag na početnu
            </button>
          </form>
        </div>
        ) : null}
      </main>
    </>
  );
}
