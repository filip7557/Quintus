"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NavBar from "@/components/NavBar/NavBar";
import { getOffers } from "@/services/offerService";
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

function normalizeOffer(offer) {
  const items = Array.isArray(offer?.Items)
    ? offer.Items
    : Array.isArray(offer?.items)
      ? offer.items
      : [];

  const calculatedTotal = items.reduce((sum, item) => {
    const quantity = Number(pickField(item, ["Quantity", "quantity"], 0));
    const price = Number(pickField(item, ["Price", "price"], 0));
    return sum + quantity * price;
  }, 0);

  return {
    id: pickField(offer, ["Id", "id"], ""),
    buyerName: pickField(offer, ["BuyerName", "buyerName"], "—"),
    buyerEmail: pickField(offer, ["BuyerEmail", "buyerEmail"], "—"),
    buyerPhone: pickField(offer, ["BuyerPhone", "buyerPhone"], "—"),
    createdAt: pickField(offer, ["CreatedAt", "createdAt", "Date", "date"], ""),
    total: Number(
      pickField(offer, ["TotalAmount", "totalAmount", "Total", "total"], calculatedTotal)
    ),
    itemsCount: items.length,
  };
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

export default function OffersListPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [rowNavigationEnabled, setRowNavigationEnabled] = useState(true);

  const openOfferDetails = (offerId) => {
    if (!offerId) return;
    router.push(`/offers/${encodeURIComponent(String(offerId))}`);
  };

  const syncUrl = ({ nextSearch, nextStartDate, nextEndDate, nextPage, nextPageSize }) => {
    const params = new URLSearchParams();

    if (nextSearch?.trim()) params.set("search", nextSearch.trim());
    if (nextStartDate) params.set("dateFrom", nextStartDate);
    if (nextEndDate) params.set("dateTo", nextEndDate);
    params.set("page", String(nextPage));
    params.set("pageSize", String(nextPageSize));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const loadOffers = async ({
    nextPage = page,
    nextPageSize = pageSize,
    nextSearch = searchTerm,
    nextStartDate = startDate,
    nextEndDate = endDate,
    updateUrl = true,
  } = {}) => {
    setLoading(true);
    setError("");

    if (updateUrl) {
      syncUrl({ nextSearch, nextStartDate, nextEndDate, nextPage, nextPageSize });
    }

    const response = await getOffers({
      search: nextSearch,
      dateFrom: nextStartDate || undefined,
      dateTo: nextEndDate || undefined,
      page: nextPage,
      pageSize: nextPageSize,
    });

    if (response?.status >= 200 && response?.status < 300) {
      const payload = response?.data;
      const offerItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.Items)
          ? payload.Items
        : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.Data)
            ? payload.Data
          : Array.isArray(payload?.data)
            ? payload.data
              : Array.isArray(payload?.Results)
                ? payload.Results
                : Array.isArray(payload?.results)
                  ? payload.results
            : [];

      const resolvedTotalCount = Number(
        pickField(payload, ["TotalCount", "totalCount", "Count", "count"], offerItems.length)
      );
      const resolvedTotalPages = Number(
        pickField(payload, ["TotalPages", "totalPages"], Math.max(1, Math.ceil(resolvedTotalCount / nextPageSize)))
      );
      const resolvedPage = Number(
        pickField(payload, ["Page", "page", "CurrentPage", "currentPage"], nextPage)
      );

      setOffers(offerItems.map(normalizeOffer));
      setTotalCount(Number.isFinite(resolvedTotalCount) ? resolvedTotalCount : offerItems.length);
      setTotalPages(Number.isFinite(resolvedTotalPages) && resolvedTotalPages > 0 ? resolvedTotalPages : 1);
      setPage(Number.isFinite(resolvedPage) && resolvedPage > 0 ? resolvedPage : nextPage);
      setPageSize(nextPageSize);
    } else {
      setOffers([]);
      setTotalCount(0);
      setTotalPages(1);
      setError(response?.data?.message || "Greška pri dohvaćanju ponuda.");
    }

    setLoading(false);
  };

  useEffect(() => {
    const mediaTouch = window.matchMedia("(pointer: coarse)");
    const mediaNarrow = window.matchMedia("(max-width: 768px)");

    const applyInteractionMode = () => {
      // On touch/narrow screens use explicit button-only navigation to avoid accidental opens while scrolling.
      setRowNavigationEnabled(!(mediaTouch.matches || mediaNarrow.matches));
    };

    applyInteractionMode();

    mediaTouch.addEventListener("change", applyInteractionMode);
    mediaNarrow.addEventListener("change", applyInteractionMode);
    window.addEventListener("resize", applyInteractionMode);

    return () => {
      mediaTouch.removeEventListener("change", applyInteractionMode);
      mediaNarrow.removeEventListener("change", applyInteractionMode);
      window.removeEventListener("resize", applyInteractionMode);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || "";
    const initialDateFrom = params.get("dateFrom") || "";
    const initialDateTo = params.get("dateTo") || "";
    const parsedPage = Number.parseInt(params.get("page") || "1", 10);
    const parsedPageSize = Number.parseInt(params.get("pageSize") || "10", 10);

    const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const initialPageSize = Number.isFinite(parsedPageSize) && parsedPageSize > 0
      ? parsedPageSize
      : 10;

    setSearchTerm(initialSearch);
    setStartDate(initialDateFrom);
    setEndDate(initialDateTo);

    loadOffers({
      nextPage: initialPage,
      nextPageSize: initialPageSize,
      nextSearch: initialSearch,
      nextStartDate: initialDateFrom,
      nextEndDate: initialDateTo,
      updateUrl: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    await loadOffers({
      nextPage: 1,
      nextPageSize: pageSize,
      nextSearch: searchTerm,
      nextStartDate: startDate,
      nextEndDate: endDate,
    });
  };

  const handleReset = async () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    await loadOffers({
      nextPage: 1,
      nextPageSize: pageSize,
      nextSearch: "",
      nextStartDate: "",
      nextEndDate: "",
    });
  };

  const handlePageSizeChange = async (e) => {
    const nextPageSize = Number(e.target.value);
    await loadOffers({ nextPage: 1, nextPageSize });
  };

  const handlePrevPage = async () => {
    if (page <= 1 || loading) return;
    await loadOffers({ nextPage: page - 1, nextPageSize: pageSize });
  };

  const handleNextPage = async () => {
    if (page >= totalPages || loading) return;
    await loadOffers({ nextPage: page + 1, nextPageSize: pageSize });
  };

  return (
    <>
      <NavBar />
      <main className={styles.container}>
        <section className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Popis ponuda</h1>
              <p className={styles.subtitle}>
                Pretražite ponude po emailu ili imenu kupca i filtrirajte po datumu.
              </p>
            </div>
            <Link href="/offers/create" className={styles.createBtn}>
              Nova ponuda
            </Link>
          </div>

          <form className={styles.filters} onSubmit={handleFilterSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="offerSearch">Pretraga</label>
              <input
                id="offerSearch"
                type="text"
                placeholder="Ime kupca ili email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="startDate">Datum od</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endDate">Datum do</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className={styles.filterActions}>
              <div className={styles.filterActionsButtons}>
                <button type="submit" className={styles.primaryBtn} disabled={loading}>
                  {loading ? "Učitavanje..." : "Primijeni"}
                </button>
                <button type="button" className={styles.secondaryBtn} onClick={handleReset}>
                  Reset
                </button>
              </div>
            </div>
          </form>

          {error ? <div className={styles.errorMessage}>{error}</div> : null}

          <div className={styles.summaryBar}>
            <span>Prikazano: {offers.length} / Ukupno: {totalCount}</span>
          </div>

          {offers.length === 0 && !loading ? (
            <div className={styles.emptyMessage}>Nema ponuda za odabrane filtere.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Kupac</th>
                    <th>Email</th>
                    <th>Telefon</th>
                    <th>Stavke</th>
                    <th>Ukupno (€)</th>
                    <th>Datum</th>
                    <th>Detalji</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr
                      key={offer.id || `${offer.buyerName}-${offer.createdAt}`}
                      className={offer.id && rowNavigationEnabled ? styles.clickableRow : ""}
                      role={offer.id && rowNavigationEnabled ? "button" : undefined}
                      tabIndex={offer.id && rowNavigationEnabled ? 0 : undefined}
                      onClick={
                        offer.id && rowNavigationEnabled
                          ? () => openOfferDetails(offer.id)
                          : undefined
                      }
                      onKeyDown={(e) => {
                        if (!offer.id || !rowNavigationEnabled) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openOfferDetails(offer.id);
                        }
                      }}
                    >
                      <td data-label="Kupac" className={styles.mobilePrimaryCell}>{offer.buyerName}</td>
                      <td data-label="Email">{offer.buyerEmail}</td>
                      <td data-label="Telefon">{offer.buyerPhone}</td>
                      <td data-label="Stavke">{offer.itemsCount}</td>
                      <td data-label="Ukupno" className={styles.mobilePriceCell}>
                        {Number.isFinite(offer.total) ? offer.total.toFixed(2) : "0.00"}
                      </td>
                      <td data-label="Datum">{formatDate(offer.createdAt)}</td>
                      <td className={styles.detailsCell}>
                        <button
                          type="button"
                          className={styles.detailsBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            openOfferDetails(offer.id);
                          }}
                          disabled={!offer.id}
                        >
                          Otvori
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.paginationBar}>
            <div className={styles.paginationInfo}>Stranica {page} od {totalPages}</div>
            <div className={styles.paginationControls}>
              <label htmlFor="pageSize" className={styles.pageSizeLabel}>
                Po stranici
              </label>
              <select
                id="pageSize"
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={handlePageSizeChange}
                disabled={loading}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handlePrevPage}
                disabled={loading || page <= 1}
              >
                Prethodna
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleNextPage}
                disabled={loading || page >= totalPages}
              >
                Sljedeća
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
