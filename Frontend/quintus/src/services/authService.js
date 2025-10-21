import api from "@/lib/api";

export async function getCurrentUser() {
  try {
    const response = await api.get("/Auth/getCurrentUser");
    return response.data; // user object
  } catch (error) {
    if (error.response?.status === 401) {
      // user not logged in, safely return null
      return null;
    }
    throw error;
  }
}

export async function login(email, password) {
  const response = await api.post("/Auth/login", { email, password });
  const { accessToken, refreshToken } = response.data;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  return response.data;
}

export async function register(data) {
  const response = await api.post("/Auth/register", data);
  return response.data;
}
export async function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  await api.post("/Auth/logout");
}