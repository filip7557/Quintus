import api from "@/lib/api";

export async function createRequest(title, description, images = []) {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await api.post("/Request", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    return error.response;
  }
}

export async function getRequests() {
  try {
    const response = await api.get("/Request");
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function getRequestsPaged({
  dateFrom,
  dateTo,
  page = 1,
  pageSize = 20,
} = {}) {
  const params = {};
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;
  params.page = page;
  params.pageSize = pageSize;

  try {
    const response = await api.get("/Request", { params });
    return response;
  } catch (error) {
    if (error?.response?.status === 404) {
      try {
        const fallback = await api.get("/Request", { params });
        return fallback;
      } catch (fallbackError) {
        return fallbackError.response;
      }
    }
    return error.response;
  }
}

export async function getRequestById(id) {
  try {
    const response = await api.get(`/Request/${id}`);
    return response;
  } catch (error) {
    if (error?.response?.status === 404) {
      try {
        const fallback = await api.get(`/Request/${id}`);
        return fallback;
      } catch (fallbackError) {
        return fallbackError.response;
      }
    }
    return error.response;
  }
}

export async function updateRequest(id, title, description, images = []) {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await api.put(`/Request/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    return error.response;
  }
}

export async function deleteRequest(id) {
  try {
    const response = await api.delete(`/Request/${id}`);
    return response;
  } catch (error) {
    return error.response;
  }
}
