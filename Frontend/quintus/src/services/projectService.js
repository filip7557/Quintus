import api from "@/lib/api";

export async function getProjects(params, signal) {
  return (await api.get("/Project", { params, signal })).data;
}

export async function getProject(id, signal) {
  return (await api.get(`/Project/${id}`, { signal })).data;
}

export async function saveProject(values, id) {
  return (await (id ? api.put(`/Project/${id}`, values) : api.post("/Project", values))).data;
}

export async function deleteProject(id) {
  await api.delete(`/Project/${id}`);
}

export async function getProjectPhotos(id, page, signal) {
  return (await api.get(`/Project/${id}/images`, { params: { page, pageSize: 24 }, signal })).data;
}

export async function uploadProjectPhoto(id, file, onUploadProgress, signal) {
  const form = new FormData();
  form.append("file", file);
  return (await api.post(`/Project/${id}/images`, form, { onUploadProgress, signal })).data;
}

export async function deleteProjectPhoto(id, photoId) {
  await api.delete(`/Project/${id}/images/${photoId}`);
}

export function projectError(error) {
  const data = error?.response?.data;
  if (typeof data === "string" && data && !data.trim().startsWith("<")) return data;
  if (error?.response?.status === 413) return "Slika je prevelika. Najveća veličina je 20 MB.";
  if (error?.response?.status === 403) return "Nemate ovlasti za pristup galeriji.";
  if (error?.response?.status === 404) return "Projekt ili fotografija više nisu dostupni.";
  if (data?.errors) return Object.values(data.errors).flat().join(" ");
  return "Promjena nije spremljena. Provjerite vezu i pokušajte ponovno.";
}