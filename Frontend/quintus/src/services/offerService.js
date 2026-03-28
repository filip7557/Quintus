import api from "@/lib/api";

export async function createOffer({ buyerName, buyerEmail, buyerPhone, items = [] }) {
  try {
    // Ensure items are properly formatted as ItemDTO
    const formattedItems = (Array.isArray(items) ? items : []).map((item) => ({
      Name: item.name || item.Name,
      Quantity: item.quantity || item.Quantity,
      Price: item.price || item.Price,
    }));

    const response = await api.post("/Offer", {
      BuyerName: buyerName,
      BuyerEmail: buyerEmail,
      BuyerPhone: buyerPhone || null,
      Items: formattedItems,
    }, {
      responseType: 'blob' // Expect PDF file as response
    });

    return response;
  } catch (error) {
    return error.response;
  }
}

export function downloadPDF(blob, fileName = 'ponuda.pdf') {
  // Create blob URL and trigger download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
