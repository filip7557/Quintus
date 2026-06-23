"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./OfferForm.module.css";
import { createOffer, downloadPDF } from "@/services/offerService";
import {
  getUnitsOfMeasurement,
  createUnitOfMeasurement,
  deleteUnitOfMeasurement,
} from "@/services/unitOfMeasurementService";

export default function OfferForm() {
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDiscountPercent, setItemDiscountPercent] = useState("0");
  const [itemUnit, setItemUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [customMessage, setCustomMessage] = useState(null);

  // Unit of measurement state
  const [units, setUnits] = useState([]);
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");
  const [unitLoading, setUnitLoading] = useState(false);
  const [deleteUnitId, setDeleteUnitId] = useState(null);
  const unitDropdownRef = useRef(null);

  const normalizeDiscountPercent = (value) => {
    const numeric = Number.parseFloat(String(value ?? "0").replace(",", "."));
    if (!Number.isFinite(numeric)) return 0;
    return Math.min(100, Math.max(0, numeric));
  };

  const parseItemNumber = (value, fallback = 0) => {
    const numeric = Number.parseFloat(String(value ?? fallback).replace(",", "."));
    return Number.isFinite(numeric) ? numeric : fallback;
  };

  // Fetch units on mount
  useEffect(() => {
    fetchUnits();
  }, []);

  // Apply prefill from sessionStorage (set by offer details page)
  useEffect(() => {
    const raw = sessionStorage.getItem("offerPrefill");
    if (!raw) return;
    sessionStorage.removeItem("offerPrefill");
    try {
      const prefill = JSON.parse(raw);
      if (prefill.buyerName) setBuyerName(prefill.buyerName);
      if (prefill.buyerEmail) setBuyerEmail(prefill.buyerEmail);
      if (prefill.buyerPhone) setBuyerPhone(prefill.buyerPhone);
      if (Array.isArray(prefill.items) && prefill.items.length > 0) {
        setItems(
          prefill.items.map((item) => ({
            id: item.id ?? Date.now() + Math.random(),
            name: item.name || "",
            unitOfMeasurement: item.unitOfMeasurement || "",
            quantity: parseItemNumber(item.quantity, 1),
            price: parseItemNumber(item.price, 0),
            discountPercent: normalizeDiscountPercent(
              item.discountPercent ?? item.DiscountPercent ?? 0
            ),
          }))
        );
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(e.target)) {
        setUnitDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnits = async () => {
    try {
      const data = await getUnitsOfMeasurement();
      setUnits(data);
    } catch {
      // silently fail
    }
  };

  const handleCreateUnit = async () => {
    if (!newUnitName.trim()) return;
    setUnitLoading(true);
    try {
      await createUnitOfMeasurement(newUnitName.trim());
      await fetchUnits();
      setNewUnitName("");
      setShowUnitModal(false);
    } catch {
      // silently fail
    } finally {
      setUnitLoading(false);
    }
  };

  const handleDeleteUnit = (e, unitId) => {
    e.stopPropagation();
    setDeleteUnitId(unitId);
  };

  const confirmDeleteUnit = async () => {
    if (!deleteUnitId) return;
    try {
      await deleteUnitOfMeasurement(deleteUnitId);
      setUnits((prev) => prev.filter((u) => u.id !== deleteUnitId));
      if (itemUnit === deleteUnitId) setItemUnit("");
    } catch {
      // silently fail
    } finally {
      setDeleteUnitId(null);
    }
  };

  // Add item to table
  const handleAddItem = () => {
    const errors = [];
    if (!itemName.trim()) errors.push("Ime proizvoda je obavezno");
    if (!itemQuantity || itemQuantity <= 0) errors.push("Količina mora biti > 0");
    if (!itemPrice || itemPrice < 0) errors.push("Cijena mora biti >= 0");

    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    setError(null);
    const selectedUnit = units.find((u) => u.id === itemUnit);
    const newItem = {
      id: Date.now(),
      name: itemName.trim(),
      unitOfMeasurement: selectedUnit ? selectedUnit.name : "",
      quantity: parseItemNumber(itemQuantity, 1),
      price: parseItemNumber(itemPrice, 0),
      discountPercent: normalizeDiscountPercent(itemDiscountPercent),
    };

    setItems([...items, newItem]);
    setItemName("");
    setItemUnit("");
    setItemQuantity("1");
    setItemPrice("");
    setItemDiscountPercent("0");
  };

  // Remove item from table
  const handleRemoveItem = (itemId) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const handleItemDiscountChange = (itemId, value) => {
    const normalized = normalizeDiscountPercent(value);
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, discountPercent: normalized } : item
      )
    );
  };

  // Calculate item total
  const calculateItemTotal = (quantity, price, discountPercent = 0) => {
    const discountMultiplier = 1 - normalizeDiscountPercent(discountPercent) / 100;
    return (quantity * price * discountMultiplier).toFixed(2);
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    return items
      .reduce(
        (sum, item) =>
          sum +
          item.quantity *
            item.price *
            (1 - normalizeDiscountPercent(item.discountPercent) / 100),
        0
      )
      .toFixed(2);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    const errors = [];
    if (!buyerName.trim()) errors.push("Ime kupca je obavezno");
    if (buyerEmail.trim() && !buyerEmail.includes("@"))
      errors.push("Validan email je obavezan");
    if (items.length === 0) errors.push("Najmanje jedan proizvod je obavezan");

    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    setLoading(true);

    try {
      const response = await createOffer({
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim() || null,
        buyerPhone: buyerPhone.trim() || null,
        items: items.map((item) => ({
          name: item.name,
          unitOfMeasurement: item.unitOfMeasurement || null,
          quantity: item.quantity,
          price: item.price,
          discountPercent: normalizeDiscountPercent(item.discountPercent),
        })),
        customMessage: customMessage?.trim() || null,
      });

      if (response?.status === 200 || response?.status === 201) {
        setSuccess(true);

        // Download PDF if backend returned it
        if (response?.data instanceof Blob) {
          const fileName = `ponuda_${buyerName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
          downloadPDF(response.data, fileName);
        }

        // Clear form
        setBuyerName("");
        setBuyerEmail("");
        setBuyerPhone("");
        setItems([]);
        setItemName("");
        setItemUnit("");
        setItemQuantity("1");
        setItemPrice("");
        setItemDiscountPercent("0");
        setCustomMessage(null);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(
          response?.data?.message || "Greška pri slanju ponude. Pokušajte ponovno."
        );
      }
    } catch (err) {
      setError("Greška pri slanju ponude. Pokušajte ponovno.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    buyerName.trim().length > 0 &&
    items.length > 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Kreiraj novu ponudu</h1>
        <p className={styles.subtitle}>
          Popunite detalje kupca i dodajte proizvode u ponudu.
        </p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && (
        <div className={styles.successMessage}>Ponuda je uspješno poslana!</div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Buyer Information Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Detalji kupca</h2>

          <div className={styles.formGroup}>
            <label htmlFor="buyerName">Ime kupca *</label>
            <input
              id="buyerName"
              type="text"
              placeholder="Unesite ime kupca"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="buyerEmail">Email kupca (opcionalno)</label>
            <input
              id="buyerEmail"
              type="email"
              placeholder="kupac@primjer.com"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="buyerPhone">Telefon kupca (opcionalno)</label>
            <input
              id="buyerPhone"
              type="tel"
              placeholder="+385 1 1234 5678"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Items Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Proizvodi</h2>

          <div className={styles.itemInputSection}>
            <div className={styles.itemInputGroup}>
              <div className={styles.formGroup}>
                <label htmlFor="itemName">Naziv proizvoda</label>
                <input
                  id="itemName"
                  type="text"
                  placeholder="npr. Laptop"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>

              <div className={styles.formGroup} ref={unitDropdownRef}>
                <label>Jed. mjera</label>
                <div
                  className={styles.unitDropdownTrigger}
                  onClick={() => setUnitDropdownOpen((prev) => !prev)}
                >
                  <span className={itemUnit ? styles.unitSelected : styles.unitPlaceholder}>
                    {itemUnit
                      ? units.find((u) => u.id === itemUnit)?.name || "—"
                      : "Odaberi"}
                  </span>
                  <svg className={styles.unitChevron} width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {unitDropdownOpen && (
                  <div className={styles.unitDropdownMenu}>
                    {units.map((unit) => (
                      <div
                        key={unit.id}
                        className={`${styles.unitDropdownItem} ${itemUnit === unit.id ? styles.unitDropdownItemActive : ""}`}
                        onClick={() => {
                          setItemUnit(unit.id);
                          setUnitDropdownOpen(false);
                        }}
                      >
                        <span>{unit.name}</span>
                        <button
                          type="button"
                          className={styles.unitDeleteBtn}
                          onClick={(e) => handleDeleteUnit(e, unit.id)}
                          title="Izbriši"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M5.5 2.5h3M2 4h10m-1 0-.35 5.26c-.1 1.47-.15 2.2-.54 2.75a2 2 0 0 1-.87.7c-.6.29-1.34.29-2.81.29h-.86c-1.47 0-2.2 0-2.81-.29a2 2 0 0 1-.87-.7c-.39-.55-.44-1.28-.54-2.75L3 4m3 3v3m2-3v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                    <div
                      className={styles.unitDropdownAdd}
                      onClick={() => {
                        setUnitDropdownOpen(false);
                        setShowUnitModal(true);
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span>Dodaj novu</span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="itemQuantity">Količina</label>
                <input
                  id="itemQuantity"
                  type="number"
                  placeholder="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  min="1"
                  step="1"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="itemPrice">Cijena (€)</label>
                <input
                  id="itemPrice"
                  type="number"
                  placeholder="0.00"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="itemDiscountPercent">Popust (%)</label>
                <input
                  id="itemDiscountPercent"
                  type="number"
                  placeholder="0"
                  value={itemDiscountPercent}
                  onChange={(e) => setItemDiscountPercent(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <button
                type="button"
                className={styles.addItemBtn}
                onClick={handleAddItem}
                disabled={!itemName.trim() || !itemUnit || !itemQuantity || itemQuantity <= 0 || !itemPrice || itemPrice < 0}
              >
                Dodaj proizvod
              </button>
            </div>

            {/* Items Table */}
            {items.length > 0 && (
              <div className={styles.tableWrapper}>
                <table className={styles.itemsTable}>
                  <colgroup>
                    <col className={styles.nameColumn} />
                    <col className={styles.unitColumn} />
                    <col className={styles.quantityColumn} />
                    <col className={styles.priceColumn} />
                    <col className={styles.discountColumn} />
                    <col className={styles.totalColumn} />
                    <col className={styles.actionColumn} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={styles.nameHeader}>Naziv</th>
                      <th className={styles.unitHeader}>Jed. mjera</th>
                      <th className={styles.quantityHeader}>Količina</th>
                      <th className={styles.priceHeader}>Cijena (€)</th>
                      <th className={styles.discountHeader}>Popust (%)</th>
                      <th className={styles.totalHeader}>Ukupno (€)</th>
                      <th className={styles.actionHeader}>Radnja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className={styles.nameCell} data-label="Naziv">
                          <span className={styles.cellValue}>{item.name}</span>
                        </td>
                        <td className={styles.unitCell} data-label="Jed. mjera">
                          <span className={styles.cellValue}>{item.unitOfMeasurement || "—"}</span>
                        </td>
                        <td className={styles.quantityCell} data-label="Količina">
                          <span className={styles.cellValue}>{item.quantity}</span>
                        </td>
                        <td className={styles.priceCell} data-label="Cijena (€)">
                          <span className={styles.cellValue}>
                            {item.price.toFixed(2)}
                          </span>
                        </td>
                        <td className={styles.discountCell} data-label="Popust (%)">
                          <input
                            type="number"
                            value={normalizeDiscountPercent(item.discountPercent)}
                            onChange={(e) => handleItemDiscountChange(item.id, e.target.value)}
                            min="0"
                            max="100"
                            step="0.01"
                            className={styles.discountInput}
                            aria-label={`Popust za ${item.name}`}
                          />
                        </td>
                        <td className={styles.totalCell} data-label="Ukupno (€)">
                          <span className={styles.cellValue}>
                            {calculateItemTotal(item.quantity, item.price, item.discountPercent)}
                          </span>
                        </td>
                        <td className={styles.actionCell} data-label="Radnja">
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            Izbriši
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            )}

            {items.length === 0 && (
              <div className={styles.emptyMessage}>
                Nema dodanih proizvoda. Dodajte proizvod da biste nastavili.
              </div>
            )}
          </div>
        </div>

        {/* Custom message */}
        <div className={styles.section}>
          <div className={styles.formGroup}>
            <label htmlFor="customMessage">Napomena (opcionalno)</label>
            <textarea
              id="customMessage"
              className={styles.notesTextarea}
              placeholder="Dodajte napomenu uz ponudu..."
              value={customMessage ?? ""}
              onChange={(e) => setCustomMessage(e.target.value || null)}
              rows={4}
              maxLength={1000}
            />
          </div>
        </div>

        <div className={styles.submitBar}>
          {items.length > 0 && (
            <div className={styles.submitSummary}>
              <span className={styles.grandTotalLabel}>Ukupno:</span>
              <span className={styles.grandTotalValue}>
                €{calculateGrandTotal()}
              </span>
            </div>
          )}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!isFormValid || loading}
          >
            {loading ? "Slanje..." : "Spremi i pošalji"}
          </button>
        </div>
      </form>

      {/* Unit of Measurement Modal */}
      {showUnitModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUnitModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Nova jedinica mjere</h3>
            <div className={styles.formGroup}>
              <label htmlFor="newUnitName">Naziv</label>
              <input
                id="newUnitName"
                type="text"
                placeholder="npr. kom, kg, m²"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateUnit()}
                autoFocus
                maxLength={50}
              />
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => {
                  setShowUnitModal(false);
                  setNewUnitName("");
                }}
              >
                Odustani
              </button>
              <button
                type="button"
                className={styles.modalSaveBtn}
                onClick={handleCreateUnit}
                disabled={!newUnitName.trim() || unitLoading}
              >
                {unitLoading ? "Spremanje..." : "Spremi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Unit Confirmation Modal */}
      {deleteUnitId !== null && (
        <div className={styles.modalOverlay} onClick={() => setDeleteUnitId(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Brisanje jedinice mjere</h3>
            <p className={styles.modalText}>
              Jeste li sigurni da želite izbrisati ovu jedinicu mjere?
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setDeleteUnitId(null)}
              >
                Odustani
              </button>
              <button
                type="button"
                className={styles.modalDeleteBtn}
                onClick={confirmDeleteUnit}
              >
                Izbriši
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
