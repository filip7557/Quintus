import api from "@/lib/api";

export async function getDiplomas() {
  try {
    return await api.get("/Diplomas");
  } catch (error) {
    return error.response;
  }
}

export async function addDiploma(diploma) {
  try {
    return await api.post("/Diplomas", diploma);
  } catch (error) {
    return null;
  }
}

export async function updateDiploma(diploma) {
  try {
    return await api.put(`/Diplomas/${diploma.id}`, diploma);
  } catch (error) {
    return error.response;
  }
}

export async function updateDiplomaImage(diplomaId, image) {
  try {
    return await api.put(`/Diplomas/${diplomaId}/image`, image);
  } catch (error) {
    return error.response;
  }
}

export async function deleteDiploma(diplomaId) {
  try {
    return await api.delete(`/Diplomas/${diplomaId}`);
  } catch (error) {
    return error.response;
  }
}
