import styles from "./DiplomaCard.module.css";
import { useState } from "react";
import PdfModal from "../Home/PdfModal";

export default function DiplomaCard({
  diploma,
  setEditingDiploma,
  setModalOpen,
  canManage,
}) {

  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  return (
    <>
    <div className={styles.diplomaCard}>
      {diploma.imageUrl && (
        <img
          className={styles.diplomaImage}
          src={diploma.imageUrl}
          alt={diploma.title}
        />
      )}
      <div className={styles.diplomaContent}>
        <h3 className={styles.diplomaTitle}>{diploma.title}</h3>
        {diploma.description && (
          <p className={styles.diplomaDescription}>{diploma.description}</p>
        )}
        <div className={styles.diplomaAction}>
          {diploma.url ? (
            <a
              className={styles.diplomaLink}
              href={diploma.url || "#"}
              aria-disabled={!diploma.url}
              onClick={(event) => {
                event.preventDefault();
                setPdfModalOpen(true);
              }}
            >
              Pogledaj certifikat
            </a>
          ) : null}
        </div>
      </div>
    </div>
    {canManage ? (
        <div className="service-edit-button-wrap">
          <button
            type="button"
            className="edit-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditingDiploma(diploma);
              setModalOpen(true);
            }}
          >
            <span className="edit-button-icon" aria-hidden="true">
              ✎
            </span>
            Uredi
          </button>
        </div>
      ) : null}
    <PdfModal
      open={pdfModalOpen}
      onClose={() => setPdfModalOpen(false)}
      url={diploma.url}
      title="Pregled certifikata"
    />
    </> 
  );
}
