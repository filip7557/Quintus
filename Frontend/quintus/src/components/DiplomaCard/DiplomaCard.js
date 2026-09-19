import styles from "./DiplomaCard.module.css";

export default function DiplomaCard({ diploma }) {
    return (
        <div className={styles.diplomaCard}>
            {diploma.image && (
                <img
                    className={styles.diplomaImage}
                    src={diploma.image}
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
    );
}