"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import NavBar from "@/components/NavBar/NavBar";
import { createRequest } from "@/services/requestService";
import { getCurrentUser } from "@/services/authService";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export default function CreateRequestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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
    setImages(e.target.files ? Array.from(e.target.files) : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formWarning) {
      setError(formWarning);
      return;
    }

    setLoading(true);

    try {
      const response = await createRequest(title, description, images);

      if (response?.status === 200 || response?.status === 201) {
        setSuccess(true);
        setTitle("");
        setDescription("");
        setImages([]);
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

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const invalidImage = images.find((image) => !image.type.startsWith("image/"));
  const oversizedImage = images.find((image) => image.size > MAX_IMAGE_SIZE_BYTES);
  const formWarning =
    trimmedTitle.length > 0 && trimmedTitle.length < 3
      ? "Naslov mora imati najmanje 3 znaka."
      : trimmedDescription.length > 0 && trimmedDescription.length < 10
        ? "Opis mora imati najmanje 10 znakova."
        : images.length === 0
          ? "Odaberite najmanje jednu fotografiju."
          : invalidImage
            ? `${invalidImage.name} nije podržana fotografija.`
            : oversizedImage
              ? `Fotografija ${oversizedImage.name} veća je od 5 MB.`
              : "";
  const isFormValid =
    trimmedTitle.length >= 3 &&
    trimmedTitle.length <= 200 &&
    trimmedDescription.length >= 10 &&
    trimmedDescription.length <= 4000 &&
    images.length > 0 &&
    !invalidImage &&
    !oversizedImage;

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
                minLength={3}
                maxLength={200}
                required
              />
              <span className={styles.charCount}>
                {title.length}/200
              </span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Opis zahtjeva *</label>
              <textarea
                id="description"
                placeholder="Detaljno opišite problem ili zahtjev"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minLength={10}
                maxLength={4000}
                rows={5}
                required
              />
              <span className={styles.charCount}>
                {description.length}/4000
              </span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="images">Fotografije *</label>
              <div className={styles.fileInput}>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  required
                  onChange={handleImageChange}
                />
                <span className={styles.fileLabel}>
                  {images.length > 0
                    ? `odabrano ${images.length} fotografij${images.length !== 1 ? "e" : "a"}`
                    : "Kliknite za odabir fotografija"}
                </span>
              </div>
              <p className={styles.fileInfo}>
                Možete odabrati više slika. Maksimalna veličina: 5MB po slici.
              </p>
            </div>

            {formWarning && (
              <div className={styles.errorMessage} role="alert">
                {formWarning}
              </div>
            )}

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
