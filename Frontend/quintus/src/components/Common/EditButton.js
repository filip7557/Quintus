"use client";

export default function EditButton({ onClick, label = "Uredi" }) {
  return (
    <div className="section-edit-button-wrap">
      <button
        type="button"
        className="section-edit-button"
        onClick={onClick}
      >
        <span className="section-edit-button-icon" aria-hidden="true">
          ✎
        </span>
        {label}
      </button>
    </div>
  );
}
