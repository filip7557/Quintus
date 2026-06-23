"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NavBar from "@/components/NavBar/NavBar";
import { getRequestsPaged } from "@/services/requestService";
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

function normalizeRequest(request) {
  const imageUrls = Array.isArray(request?.ImageUrls)
    ? request.ImageUrls
    : Array.isArray(request?.imageUrls)
      ? request.imageUrls
      : [];

  return {
    id: pickField(request, ["Id", "id"], ""),
    title: pickField(request, ["Title", "title"], "—"),
    description: pickField(request, ["Description", "description"], "—"),
    createdAt: pickField(request, ["CreatedAt", "createdAt", "Date", "date"], ""),
    imagesCount: Number(
      pickField(request, ["ImagesCount", "imagesCount", "ImageCount", "imageCount"], imageUrls.length)
    ) || 0,
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

function truncateText(text, maxLength = 120) {
  const clean = String(text || "").trim();
  if (clean.length <= maxLength) return clean || "—";
  return `${clean.slice(0, maxLength - 1)}…`;
}

export default function RequestsListPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [rowNavigationEnabled, setRowNavigationEnabled] = useState(true);

  const openRequestDetails = (requestId) => {
    if (!requestId) return;
    router.push(`/requests/${encodeURIComponent(String(requestId))}`);
  };

  const syncUrl = ({ nextStartDate, nextEndDate, nextPage, nextPageSize }) => {
    const params = new URLSearchParams();

    if (nextStartDate) params.set("dateFrom", nextStartDate);
    if (nextEndDate) params.set("dateTo", nextEndDate);
    params.set("page", String(nextPage));
    params.set("pageSize", String(nextPageSize));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const loadRequests = async ({
    nextPage = page,
    nextPageSize = pageSize,
    nextStartDate = startDate,
    nextEndDate = endDate,
    updateUrl = true,
  } = {}) => {
    setLoading(true);
    setError("");

    if (updateUrl) {
      syncUrl({ nextStartDate, nextEndDate, nextPage, nextPageSize });
    }

    const response = await getRequestsPaged({
      dateFrom: nextStartDate || undefined,
      dateTo: nextEndDate || undefined,
      page: nextPage,
      pageSize: nextPageSize,
    });

    if (response?.status >= 200 && response?.status < 300) {
      const payload = response?.data;
      const requestItems = Array.isArray(payload)
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
        pickField(payload, ["TotalCount", "totalCount", "Count", "count"], requestItems.length)
      );
      const resolvedTotalPages = Number(
        pickField(
          payload,
          ["TotalPages", "totalPages"],
          Math.max(1, Math.ceil(resolvedTotalCount / nextPageSize))
        )
      );
      const resolvedPage = Number(
        pickField(payload, ["Page", "page", "CurrentPage", "currentPage"], nextPage)
      );

      setRequests(requestItems.map(normalizeRequest));
      setTotalCount(Number.isFinite(resolvedTotalCount) ? resolvedTotalCount : requestItems.length);
      setTotalPages(Number.isFinite(resolvedTotalPages) && resolvedTotalPages > 0 ? resolvedTotalPages : 1);
      setPage(Number.isFinite(resolvedPage) && resolvedPage > 0 ? resolvedPage : nextPage);
      setPageSize(nextPageSize);
    } else {
      setRequests([]);
      setTotalCount(0);
      setTotalPages(1);
      setError(response?.data?.message || "Greška pri dohvaćanju zahtjeva.");
    }

    setLoading(false);
  };

  useEffect(() => {
    const mediaTouch = window.matchMedia("(pointer: coarse)");
    const mediaNarrow = window.matchMedia("(max-width: 768px)");

    const applyInteractionMode = () => {
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
    const initialDateFrom = params.get("dateFrom") || "";
    const initialDateTo = params.get("dateTo") || "";
    const parsedPage = Number.parseInt(params.get("page") || "1", 10);
    const parsedPageSize = Number.parseInt(params.get("pageSize") || "20", 10);

    const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const initialPageSize = Number.isFinite(parsedPageSize) && parsedPageSize > 0
      ? parsedPageSize
      : 20;

    setStartDate(initialDateFrom);
    setEndDate(initialDateTo);

    loadRequests({
      nextPage: initialPage,
      nextPageSize: initialPageSize,
      nextStartDate: initialDateFrom,
      nextEndDate: initialDateTo,
      updateUrl: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    await loadRequests({
      nextPage: 1,
      nextPageSize: pageSize,
      nextStartDate: startDate,
      nextEndDate: endDate,
    });
  };

  const handleReset = async () => {
    setStartDate("");
    setEndDate("");
    await loadRequests({
      nextPage: 1,
      nextPageSize: pageSize,
      nextStartDate: "",
      nextEndDate: "",
    });
  };

  const handlePageSizeChange = async (e) => {
    const nextPageSize = Number(e.target.value);
    await loadRequests({ nextPage: 1, nextPageSize });
  };

  const handlePrevPage = async () => {
    if (page <= 1 || loading) return;
    await loadRequests({ nextPage: page - 1, nextPageSize: pageSize });
  };

  const handleNextPage = async () => {
    if (page >= totalPages || loading) return;
    await loadRequests({ nextPage: page + 1, nextPageSize: pageSize });
  };

  return (
    <>
      <NavBar />
      <main className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Popis zahtjeva</h1>
              <p className={styles.subtitle}>
                Pregled zahtjeva s filtriranjem po datumu i stranicama.
              </p>
            </div>
            <Link href="/create-request" className={styles.createBtn}>
              Novi zahtjev
            </Link>
          </div>

          <form className={styles.filters} onSubmit={handleFilterSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate">Datum od</label>
              <input
                id="startDate"
                type="date"
                lang="hr"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endDate">Datum do</label>
              <input
                id="endDate"
                type="date"
                lang="hr"
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
            <span>Prikazano: {requests.length} / Ukupno: {totalCount}</span>
          </div>

          {requests.length === 0 && !loading ? (
            <div className={styles.emptyMessage}>Nema zahtjeva za odabrane filtere.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Naslov</th>
                    <th>Opis</th>
                    <th>Slike</th>
                    <th>Datum</th>
                    <th>Detalji</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr
                      key={request.id || `${request.title}-${request.createdAt}`}
                      className={request.id && rowNavigationEnabled ? styles.clickableRow : ""}
                      role={request.id && rowNavigationEnabled ? "button" : undefined}
                      tabIndex={request.id && rowNavigationEnabled ? 0 : undefined}
                      onClick={
                        request.id && rowNavigationEnabled
                          ? () => openRequestDetails(request.id)
                          : undefined
                      }
                      onKeyDown={(e) => {
                        if (!request.id || !rowNavigationEnabled) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openRequestDetails(request.id);
                        }
                      }}
                    >
                      <td data-label="Naslov" className={styles.mobilePrimaryCell}>
                        {request.title}
                      </td>
                      <td data-label="Opis">{truncateText(request.description, 120)}</td>
                      <td data-label="Slike">{request.imagesCount}</td>
                      <td data-label="Datum">{formatDate(request.createdAt)}</td>
                      <td className={styles.detailsCell}>
                        <button
                          type="button"
                          className={styles.detailsBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            openRequestDetails(request.id);
                          }}
                          disabled={!request.id}
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
        </div>
      </main>
    </>
  );
}
