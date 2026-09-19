import api from "@/lib/api";

export async function getDiplomas() {
  try {
    return await api.get("/Certificate");
  } catch (error) {
    return error.response;
  }
}

export async function addDiploma(diploma) {
  try {
    const formData = new FormData();
    for (const key in diploma) {
      formData.append(key, diploma[key]);
    }
    return await api.post("/Certificate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    return null;
  }
}

export async function updateDiploma(diploma) {
  try {
    return await api.put(`/Certificate/${diploma.id}`, diploma);
  } catch (error) {
    return error.response;
  }
}

export async function updateDiplomaImage(diplomaId, image) {
  try {
    const formData = new FormData();
    formData.append("image", image);
    return await api.put(`/Certificate/${diplomaId}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    return error.response;
  }
}

export async function deleteDiploma(diplomaId) {
  try {
    return await api.delete(`/Certificate/${diplomaId}`);
  } catch (error) {
    return error.response;
  }
}
