import api from "@/lib/api";

export async function getOffers({
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

    const response = await api.get("/Offer", { params });
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function getOfferById(id) {
  try {
    const response = await api.get(`/Offer/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching offer by ID:", error);
    return error.response;
  }
}

export async function createOffer({ buyerName, buyerEmail, buyerPhone, items = [] }) {
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
      "/Offer",
      {
        BuyerName: buyerName,
        BuyerEmail: buyerEmail,
        BuyerPhone: buyerPhone || null,
        Items: formattedItems,
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

export async function getOfferPdf(id) {
  try {
    const response = await api.get(`/Offer/${id}/pdf`, { responseType: "blob" });
    return response;
  } catch (error) {
    return error.response;
  }
}

export function downloadPDF(blob, fileName = "ponuda.pdf") {
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
