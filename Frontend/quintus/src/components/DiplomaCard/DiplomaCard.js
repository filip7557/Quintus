import styles from "./DiplomaCard.module.css";

export default function DiplomaCard({
  diploma,
  setEditingDiploma,
  setModalOpen,
  canManage,
}) {
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
        {diploma.url && (
          <a
            className={styles.diplomaLink}
            href={diploma.url || "#"}
            aria-disabled={!diploma.url}
            onClick={(event) => {
              if (!diploma.url) event.preventDefault();
            }}
          >
            Pogledaj certifikat
          </a>
        )}
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
    </> 
  );
}
