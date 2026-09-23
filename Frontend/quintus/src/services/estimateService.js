import api from "@/lib/api";

function decodeFileName(value) {
  if (!value) return null;
  const match = /filename\*=(?:UTF-8''|utf-8''|)([^;]+)|filename="?([^";]+)"?/i.exec(value);
  const raw = match?.[1] ?? match?.[2];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw.replace(/\"/g, ''));
  } catch {
    return raw.replace(/\"/g, '');
  }
}

export function getFileNameFromResponse(response, fallback = "Predračun.pdf") {
  const header = response?.headers?.["content-disposition"] ?? response?.headers?.["Content-Disposition"];
  return decodeFileName(header) ?? fallback;
}

export function getEstimateIdFromResponse(response) {
  return response?.headers?.["x-estimate-id"] ?? response?.headers?.["X-Estimate-Id"] ?? null;
}

// Single-slot in-memory cache so the estimate page can reuse the PDF generated at creation time instead of regenerating it.
let pendingEstimatePdf = null;

export function setPendingEstimatePdf(estimateId, blob) {
  pendingEstimatePdf = estimateId && blob ? { estimateId: String(estimateId), blob } : null;
}

export function getPendingEstimatePdf(estimateId) {
  if (!pendingEstimatePdf || pendingEstimatePdf.estimateId !== String(estimateId)) return null;
  return pendingEstimatePdf.blob;
}

export function clearPendingEstimatePdf() {
  pendingEstimatePdf = null;
}

export async function getEstimates({
  search,
  dateFrom,
  dateTo,
  page = 1,
  pageSize = 10,
} = {}) {
  try {
    const params = {};

    if (search?.trim()) params.Search = search.trim();
    if (dateFrom) params.DateFrom = dateFrom;
    if (dateTo) params.DateTo = dateTo;
    params.Page = page;
    params.PageSize = pageSize;

    const response = await api.get("/Estimate", { params });
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function getEstimateById(id) {
  try {
    const response = await api.get(`/Estimate/${id}`);
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function createEstimate({
  buyerName,
  buyerEmail,
  buyerPhone,
  items = [],
  isTransactional = false,
}) {
  try {
    // Ensure items are properly formatted as ItemDTO
    const formattedItems = (Array.isArray(items) ? items : []).map((item) => ({
      Name: item.name ?? item.Name,
      UnitOfMeasurement: item.unitOfMeasurement ?? item.UnitOfMeasurement ?? null,
      Quantity: item.quantity ?? item.Quantity,
      Price: item.price ?? item.Price,
      DiscountPercent: item.discountPercent ?? item.DiscountPercent ?? 0,
    }));

    const response = await api.post(
      "/Estimate",
      {
        BuyerName: buyerName,
        BuyerEmail: buyerEmail,
        BuyerPhone: buyerPhone || null,
        Items: formattedItems,
        IsTransactional: Boolean(isTransactional),
      },
      {
        responseType: "blob", // Expect PDF file as response
      }
    );

    return response;
  } catch (error) {
    return error.response;
  }
}

export async function getEstimatePdf(id) {
  try {
    const response = await api.get(`/Estimate/${id}/pdf`, { responseType: "blob" });
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function sendEstimateEmail(id) {
  try {
    const response = await api.post(`/Estimate/${id}/send-email`);
    return response;
  } catch (error) {
    return error.response;
  }
}

export function downloadPDF(blob, fileName = "predracun.pdf") {
  // Create blob URL and trigger download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
