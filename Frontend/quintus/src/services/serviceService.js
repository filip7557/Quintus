import api from "@/lib/api";

export async function createService({
  title,
  description,
  keyWords = [],
  images = [],
}) {
  try {
    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Description", description);

    (Array.isArray(keyWords) ? keyWords : []).forEach((kw) => {
      if (typeof kw === "string" && kw.trim()) formData.append("KeyWords", kw);
    });

    (Array.isArray(images) ? images : []).forEach((file) => {
      if (file) formData.append("Images", file);
    });

    const response = await api.post("/SiteSettings/services", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    return error.response;
  }
}

export async function patchService(
  id,
  { title, description, keyWords = [], images = [], existingImageUrls = [] }
) {
  try {
    const formData = new FormData();
    if (typeof title === "string") formData.append("Title", title);
    if (typeof description === "string") formData.append("Description", description);

    (Array.isArray(keyWords) ? keyWords : []).forEach((kw) => {
      if (typeof kw === "string" && kw.trim()) formData.append("KeyWords", kw);
    });

    (Array.isArray(images) ? images : []).forEach((file) => {
      if (file) formData.append("Images", file);
    });

    // Preserve existing images while adding new ones (backend should merge these).
    (Array.isArray(existingImageUrls) ? existingImageUrls : []).forEach((url) => {
      if (typeof url === "string" && url.trim()) {
        formData.append("ExistingImageUrls", url);
      }
    });

    const response = await api.patch(`/SiteSettings/services/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    return error.response;
  }
}

export async function deleteService(id) {
  try {
    const response = await api.delete(`/SiteSettings/services/${id}`);
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function reorderServices(order) {
  try {
    // API expects: { orderedServiceIds: Guid[] } (PascalCase in .NET model).
    const orderedServiceIds = Array.isArray(order) ? order : [];
    const response = await api.post("/SiteSettings/services/reorder", {
      OrderedServiceIds: orderedServiceIds,
    });
    return response;
  } catch (error) {
    return error.response;
  }
}
