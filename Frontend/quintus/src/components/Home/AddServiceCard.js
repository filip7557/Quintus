export default function AddServiceCard({ onClick }) {
  return (
    <button
      type="button"
      className="service add-service-card"
      onClick={onClick}
      aria-label="Dodaj novu uslugu"
    >
      <div className="add-service-plus" aria-hidden="true">
        +
      </div>
      <div className="add-service-label">Dodaj uslugu</div>
    </button>
  );
}
