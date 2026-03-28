"use client";

import { useState } from "react";
import styles from "./OfferForm.module.css";
import { createOffer, downloadPDF } from "@/services/offerService";

export default function OfferForm() {
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemPrice, setItemPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    const newItem = {
      id: Date.now(),
      name: itemName.trim(),
      quantity: parseInt(itemQuantity),
      price: parseFloat(itemPrice),
    };

    setItems([...items, newItem]);
    setItemName("");
    setItemQuantity("1");
    setItemPrice("");
  };

  // Remove item from table
  const handleRemoveItem = (itemId) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  // Calculate item total
  const calculateItemTotal = (quantity, price) => {
    return (quantity * price).toFixed(2);
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    return items
      .reduce((sum, item) => sum + item.quantity * item.price, 0)
      .toFixed(2);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    const errors = [];
    if (!buyerName.trim()) errors.push("Ime kupca je obavezno");
    if (!buyerEmail.trim() || !buyerEmail.includes("@"))
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
        buyerEmail: buyerEmail.trim(),
        buyerPhone: buyerPhone.trim() || null,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
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
        setItemQuantity("1");
        setItemPrice("");
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
    buyerEmail.trim().length > 0 &&
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
            <label htmlFor="buyerEmail">Email kupca *</label>
            <input
              id="buyerEmail"
              type="email"
              placeholder="kupac@primjer.com"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              required
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

              <button
                type="button"
                className={styles.addItemBtn}
                onClick={handleAddItem}
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
                    <col className={styles.quantityColumn} />
                    <col className={styles.priceColumn} />
                    <col className={styles.totalColumn} />
                    <col className={styles.actionColumn} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={styles.nameHeader}>Naziv</th>
                      <th className={styles.numberHeader}>Količina</th>
                      <th className={styles.numberHeader}>Cijena (€)</th>
                      <th className={styles.numberHeader}>Ukupno (€)</th>
                      <th className={styles.actionHeader}>Radnja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className={styles.nameCell} data-label="Naziv">
                          <span className={styles.cellValue}>{item.name}</span>
                        </td>
                        <td className={styles.numberCell} data-label="Količina">
                          <span className={styles.cellValue}>{item.quantity}</span>
                        </td>
                        <td className={styles.numberCell} data-label="Cijena (€)">
                          <span className={styles.cellValue}>
                            {item.price.toFixed(2)}
                          </span>
                        </td>
                        <td className={styles.numberCell} data-label="Ukupno (€)">
                          <span className={styles.cellValue}>
                            {calculateItemTotal(item.quantity, item.price)}
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
    </div>
  );
}
