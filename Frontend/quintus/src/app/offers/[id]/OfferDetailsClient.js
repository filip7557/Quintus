"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar/NavBar";
import { getOfferById, getOfferPdf, downloadPDF } from "@/services/offerService";
import styles from "./page.module.css";

function pickField(obj, keys, fallback = "") {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
}

function formatDate(dateValue) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OfferDetailsClient({ offerId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offer, setOffer] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!requestedId || pdfLoading) return;
    setPdfLoading(true);
    const response = await getOfferPdf(requestedId);
    if (response?.status >= 200 && response?.status < 300 && response?.data) {
      downloadPDF(response.data, `ponuda-${requestedId}.pdf`);
    }
    setPdfLoading(false);
  };

  const requestedId = useMemo(() => String(offerId ?? "").trim(), [offerId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!requestedId) {
        setError("Nedostaje ID ponude.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const response = await getOfferById(requestedId);
      if (cancelled) return;

      if (response?.status >= 200 && response?.status < 300 && response?.data) {
        setOffer(response.data);
      } else {
        setError(response?.data?.message || "Greška pri dohvaćanju ponude.");
      }

      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [requestedId]);

  const items = useMemo(() => {
    if (!offer) return [];
    const rawItems = Array.isArray(offer?.Items)
      ? offer.Items
      : Array.isArray(offer?.items)
        ? offer.items
        : [];

    return rawItems.map((item, index) => {
      const quantity = Number(pickField(item, ["Quantity", "quantity"], 0));
      const price = Number(pickField(item, ["Price", "price"], 0));
      return {
        id: pickField(item, ["Id", "id"], index),
        name: pickField(item, ["Name", "name"], "—"),
        unit: pickField(item, ["UnitOfMeasurement", "unitOfMeasurement"], "—"),
        quantity,
        price,
        total: quantity * price,
      };
    });
  }, [offer]);

  const buyerName = useMemo(
    () => pickField(offer, ["BuyerName", "buyerName"], "—"),
    [offer]
  );
  const buyerEmail = useMemo(
    () => pickField(offer, ["BuyerEmail", "buyerEmail"], "—"),
    [offer]
  );
  const buyerPhone = useMemo(
    () => pickField(offer, ["BuyerPhone", "buyerPhone"], "—"),
    [offer]
  );
  const createdAt = useMemo(
    () => pickField(offer, ["CreatedAt", "createdAt", "Date", "date"], ""),
    [offer]
  );

  const grandTotal = useMemo(() => {
    if (items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.total, 0);
  }, [items]);

  return (
    <>
      <NavBar />
      <main className={styles.container}>
        <section className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Detalji ponude</h1>
            </div>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => router.push("/offers/list")}
            >
              Natrag na pretragu
            </button>
          </div>

          {loading ? <div className={styles.notice}>Učitavanje...</div> : null}
          {!loading && error ? <div className={styles.errorMessage}>{error}</div> : null}

          {!loading && !error && offer ? (
            <>
              <div className={styles.infoGrid}>
                <div className={styles.infoField}>
                  <span className={styles.label}>Kupac</span>
                  <div className={styles.value}>{buyerName}</div>
                </div>
                <div className={styles.infoField}>
                  <span className={styles.label}>Email</span>
                  <div className={styles.value}>{buyerEmail}</div>
                </div>
                <div className={styles.infoField}>
                  <span className={styles.label}>Telefon</span>
                  <div className={styles.value}>{buyerPhone}</div>
                </div>
                <div className={styles.infoField}>
                  <span className={styles.label}>Datum</span>
                  <div className={styles.value}>{formatDate(createdAt)}</div>
                </div>
              </div>

              <div className={styles.summaryBar}>
                <span>Broj stavki: {items.length}</span>
                <span className={styles.summaryTotal}>Ukupno: €{grandTotal.toFixed(2)}</span>
              </div>

              {items.length === 0 ? (
                <div className={styles.emptyMessage}>Ponuda nema stavki.</div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Naziv</th>
                        <th>Jed. mjera</th>
                        <th>Količina</th>
                        <th>Cijena (€)</th>
                        <th>Ukupno (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td data-label="Naziv">{item.name}</td>
                          <td data-label="Jed. mjera">{item.unit}</td>
                          <td data-label="Količina">{Number.isFinite(item.quantity) ? item.quantity : 0}</td>
                          <td data-label="Cijena (€)">{Number.isFinite(item.price) ? item.price.toFixed(2) : "0.00"}</td>
                          <td data-label="Ukupno (€)">{Number.isFinite(item.total) ? item.total.toFixed(2) : "0.00"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={handleDownloadPdf}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? "Dohvaćanje..." : "Preuzmi PDF"}
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => {
                    sessionStorage.setItem(
                      "offerPrefill",
                      JSON.stringify({
                        buyerName,
                        buyerEmail: buyerEmail === "—" ? "" : buyerEmail,
                        buyerPhone: buyerPhone === "—" ? "" : buyerPhone,
                        items: items.map((item) => ({
                          id: Date.now() + Math.random(),
                          name: item.name,
                          unitOfMeasurement: item.unit,
                          quantity: item.quantity,
                          price: item.price,
                        })),
                      })
                    );
                    router.push("/offers/create");
                  }}
                >
                  Izrada nove ponude
                </button>
              </div>
            </>
          ) : null}
        </section>
      </main>
    </>
  );
}
