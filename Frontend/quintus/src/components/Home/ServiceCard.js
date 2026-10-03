import Link from "next/link";
import RotatingServiceImage from "@/components/Home/RotatingServiceImage";

export default function ServiceCard({
  serviceId,
  slug,
  title,
  description,
  imageUrls = [],
  keywords = [],
  rotateIntervalMs = 4500,
  canEdit = false,
  onEdit,
  isEditing = false,
  onRemoveImage,
}) {
  const keywordTags = Array.isArray(keywords) ? keywords : [];

  return (
    <Link
      href={slug ? `/usluge/${slug}` : "#"}
      className="service service-card service-card-button"
      aria-label={`Pogledaj detalje za ${title}`}
    >
      {canEdit ? (
        <div className="service-edit-button-wrap">
          <button
            type="button"
            className="edit-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <span className="edit-button-icon" aria-hidden="true">
              ✎
            </span>
            Uredi
          </button>
        </div>
      ) : null}
      <RotatingServiceImage
        imageUrls={imageUrls}
        alt={title}
        intervalMs={rotateIntervalMs}
        isEditing={isEditing}
        onRemoveImage={onRemoveImage}
      />
      <h3 className="service-title">{title}</h3>
      <div className="service-card-content">
        {description ? <p className="service-description">{description}</p> : null}
        {keywordTags.length ? (
          <ul className="service-keywords" aria-label="Ključne riječi">
            {keywordTags.map((keyword, index) => (
              <li className="service-keyword-tag" key={`${keyword}:${index}`}>
                {keyword}
              </li>
            ))}
          </ul>
        ) : null}
        <span className="service-card-action">
          Pogledaj uslugu <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </Link>
  );
}
