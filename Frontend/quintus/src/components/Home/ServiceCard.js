import RotatingServiceImage from "@/components/Home/RotatingServiceImage";

export default function ServiceCard({
  serviceId,
  title,
  description,
  imageUrls = [],
  keywords = [],
  rotateIntervalMs = 4500,
  rotationStep = 0,
  canEdit = false,
  onEdit,
  isEditing = false,
  onRemoveImage,
  onOpen,
}) {
  const keywordText = Array.isArray(keywords) ? keywords.join(" - ") : "";

  return (
    <div
      className="service service-card service-card-button"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen?.();
        }
      }}
      role="button"
      tabIndex={0}
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
      <h3 className="service-title">{title}</h3>
      <RotatingServiceImage
        imageUrls={imageUrls}
        alt={title}
        intervalMs={rotateIntervalMs}
        rotationStep={rotationStep}
        isEditing={isEditing}
        onRemoveImage={onRemoveImage}
      />
      <p className="service-description">{description}</p>
      {keywordText ? <p className="service-keywords">{keywordText}</p> : null}
    </div>
  );
}
