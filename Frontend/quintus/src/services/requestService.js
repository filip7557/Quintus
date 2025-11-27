import api from "@/lib/api";

export async function createRequest(title, description, images = []) {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await api.post("/Requests", formData, {
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
    const response = await api.get("/Requests");
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function getRequestById(id) {
  try {
    const response = await api.get(`/Requests/${id}`);
    return response;
  } catch (error) {
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

    const response = await api.put(`/Requests/${id}`, formData, {
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
    const response = await api.delete(`/Requests/${id}`);
    return response;
  } catch (error) {
    return error.response;
  }
}
