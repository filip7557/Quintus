"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar/NavBar";
import {
  getEstimateById,
  getEstimatePdf,
  sendEstimateEmail,
  downloadPDF,
  getPendingEstimatePdf,
  clearPendingEstimatePdf,
} from "@/services/estimateService";
import EstimateAccessGate from "../EstimateAccessGate";
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

function EstimateDetailsContent({ estimateId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [estimate, setEstimate] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const requestedId = useMemo(() => String(estimateId ?? "").trim(), [estimateId]);

  // Reuses the PDF cached from creation (if any) instead of asking the backend to regenerate it.
  const resolveEstimatePdfBlob = async () => {
    const cached = getPendingEstimatePdf(requestedId);
    if (cached) {
      clearPendingEstimatePdf();
      return cached;
    }
    const response = await getEstimatePdf(requestedId);
    if (response?.status >= 200 && response?.status < 300 && response?.data) {
      return response.data;
    }
    return null;
  };

  const handleDownloadPdf = async () => {
    if (!requestedId || pdfLoading) return;
    setPdfLoading(true);
    const blob = await resolveEstimatePdfBlob();
    if (blob) {
      downloadPDF(blob, `predracun-${requestedId}.pdf`);
    }
    setPdfLoading(false);
  };

  const handlePrintPdf = async () => {
    if (!requestedId || printLoading) return;
    setPrintLoading(true);
    const blob = await resolveEstimatePdfBlob();
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;

      const cleanup = () => {
        iframe.remove();
        window.URL.revokeObjectURL(url);
      };

      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        iframe.contentWindow?.addEventListener("afterprint", cleanup);
        // Fallback in case the browser doesn't fire afterprint on the iframe.
        setTimeout(cleanup, 60000);
      };

      document.body.appendChild(iframe);
    }
    setPrintLoading(false);
  };

  const handleSendEmail = async () => {
    if (!requestedId || emailLoading) return;
    setEmailLoading(true);
    setEmailMessage("");
    setEmailError("");

    const response = await sendEstimateEmail(requestedId);
    if (response?.status >= 200 && response?.status < 300) {
      setEmailMessage("Predračun je poslan na email kupca.");
    } else {
      setEmailError(response?.data?.message || "Greška pri slanju predračuna e-poštom.");
    }

    setEmailLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!requestedId) {
        setError("Nedostaje ID predračuna.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const response = await getEstimateById(requestedId);
      if (cancelled) return;

      if (response?.status >= 200 && response?.status < 300 && response?.data) {
        setEstimate(response.data);
      } else {
        setError(response?.data?.message || "Greška pri dohvaćanju predračuna.");
      }

      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [requestedId]);

  const items = useMemo(() => {
    if (!estimate) return [];
    const rawItems = Array.isArray(estimate?.Items)
      ? estimate.Items
      : Array.isArray(estimate?.items)
        ? estimate.items
        : [];

    return rawItems.map((item, index) => {
      const quantity = Number(pickField(item, ["Quantity", "quantity"], 0));
      const price = Number(pickField(item, ["Price", "price"], 0));
      const discountPercent = Number(
        pickField(item, ["DiscountPercent", "discountPercent"], 0)
      );
      const discountMultiplier = 1 - Math.min(100, Math.max(0, discountPercent)) / 100;
      return {
        id: pickField(item, ["Id", "id"], index),
        name: pickField(item, ["Name", "name"], "—"),
        unit: pickField(item, ["UnitOfMeasurement", "unitOfMeasurement"], "—"),
        quantity,
        price,
        discountPercent,
        total: quantity * price * discountMultiplier,
      };
    });
  }, [estimate]);

  const buyerName = useMemo(
    () => pickField(estimate, ["BuyerName", "buyerName"], "—"),
    [estimate]
  );
  const buyerEmail = useMemo(
    () => pickField(estimate, ["BuyerEmail", "buyerEmail"], "—"),
    [estimate]
  );
  const buyerPhone = useMemo(
    () => pickField(estimate, ["BuyerPhone", "buyerPhone"], "—"),
    [estimate]
  );
  const createdAt = useMemo(
    () => pickField(estimate, ["CreatedAt", "createdAt", "Date", "date"], ""),
    [estimate]
  );

  const grandTotal = useMemo(() => {
    if (items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.total, 0);
  }, [items]);

  const isTransactional = useMemo(
    () => Boolean(estimate?.IsTransactional ?? estimate?.isTransactional ?? false),
    [estimate]
  );

  const estimateNumber = useMemo(
    () => pickField(estimate, ["Number", "number"], ""),
    [estimate]
  );

  const estimateYear = useMemo(
    () => pickField(estimate, ["Year", "year"], ""),
    [estimate]
  );

  return (
    <>
      <NavBar />
      <main className={styles.container}>
        <section className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Detalji predračuna</h1>
            </div>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => router.push("/estimates/list")}
            >
              Natrag na pretragu
            </button>
          </div>

          {loading ? <div className={styles.notice}>Učitavanje...</div> : null}
          {!loading && error ? <div className={styles.errorMessage}>{error}</div> : null}

          {!loading && !error && estimate ? (
            <>
              <div className={styles.infoGrid}>
                <div className={styles.infoField}>
                  <span className={styles.label}>Broj predračuna</span>
                  <div className={styles.value}>
                    {estimateNumber && estimateYear ? `${estimateNumber}/${estimateYear}` : "—"}
                  </div>
                </div>
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
                  <span className={styles.label}>Način plaćanja</span>
                  <div className={styles.value}>
                    {isTransactional ? "Transakcijsko plaćanje" : "Gotovina"}
                  </div>
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
                <div className={styles.emptyMessage}>Predračun nema stavki.</div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Naziv</th>
                        <th>Jed. mjera</th>
                        <th>Količina</th>
                        <th>Cijena (€)</th>
                        <th>Popust (%)</th>
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
                          <td data-label="Popust (%)">
                            {Number.isFinite(item.discountPercent)
                              ? item.discountPercent.toFixed(2)
                              : "0.00"}
                          </td>
                          <td data-label="Ukupno (€)">{Number.isFinite(item.total) ? item.total.toFixed(2) : "0.00"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {emailMessage ? (
                <div className={styles.successMessage}>{emailMessage}</div>
              ) : null}
              {emailError ? <div className={styles.errorMessage}>{emailError}</div> : null}

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
                  className={styles.secondaryBtn}
                  onClick={handlePrintPdf}
                  disabled={printLoading}
                >
                  <svg
                    className={styles.btnIcon}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M4 6V2h8v4M4 12H2.5A1.5 1.5 0 0 1 1 10.5v-3A1.5 1.5 0 0 1 2.5 6h11A1.5 1.5 0 0 1 15 7.5v3a1.5 1.5 0 0 1-1.5 1.5H12M4 9h8v5H4V9Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {printLoading ? " Pripremanje..." : " Ispis"}
                </button>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={handleSendEmail}
                  disabled={emailLoading || buyerEmail === "—"}
                  title={buyerEmail === "—" ? "Predračun nema email kupca." : undefined}
                >
                  {emailLoading ? "Slanje..." : "Pošalji e-poštom"}
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => {
                    sessionStorage.setItem(
                      "estimatePrefill",
                      JSON.stringify({
                        buyerName,
                        buyerEmail: buyerEmail === "—" ? "" : buyerEmail,
                        buyerPhone: buyerPhone === "—" ? "" : buyerPhone,
                        isTransactional,
                        items: items.map((item) => ({
                          id: Date.now() + Math.random(),
                          name: item.name,
                          unitOfMeasurement: item.unit,
                          quantity: item.quantity,
                          price: item.price,
                          discountPercent: item.discountPercent,
                        })),
                      })
                    );
                    router.push("/estimates/create");
                  }}
                >
                  Izrada novog predračuna
                </button>
              </div>
            </>
          ) : null}
        </section>
      </main>
    </>
  );
}

export default function EstimateDetailsClient({ estimateId }) {
  return (
    <EstimateAccessGate redirectTo={`/estimates/${estimateId ?? ""}`}>
      <EstimateDetailsContent estimateId={estimateId} />
    </EstimateAccessGate>
  );
}
