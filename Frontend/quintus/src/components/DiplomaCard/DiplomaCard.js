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
                <a
                    className={styles.diplomaLink}
                    href={diploma.link || "#"}
                    aria-disabled={!diploma.link}
                    onClick={(event) => {
                        if (!diploma.link) event.preventDefault();
                    }}
                >
                    Pogledaj certifikat
                </a>
            </div>
        </div>
    );
}