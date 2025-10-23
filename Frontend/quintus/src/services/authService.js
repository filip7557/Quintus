import api from "@/lib/api";

export async function getCurrentUser() {
  try {
    const response = await api.get("/Auth/getCurrentUser");
    return response; // user object
  } catch (error) {
    if (error.response?.status === 401) {
      // user not logged in, safely return null
      return null;
    }
    return null;
  }
}

export async function login(email, password) {
  try {
  const response = await api.post("/Auth/login", { email, password });
  const { accessToken, refreshToken } = response.data;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  return response;
  } catch (error) {
    return error.response;
  } 
}

export async function register(data) {
  try {
  const response = await api.post("/Auth/register", data);
  console.log(data);
  console.log(response);
  return response;
  } catch (error) {
    return error.response;
  }
}
export async function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  await api.post("/Auth/logout");
}