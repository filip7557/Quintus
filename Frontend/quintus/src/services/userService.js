import api from "@/lib/api";

export async function getMyProfile() {
  try {
    const response = await api.get("/User");
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function getUserProfileById(userId) {
  try {
    const safeUserId = encodeURIComponent(String(userId));
    const response = await api.get(`/User/${safeUserId}`);
    return response;
  } catch (error) {
    return error.response;
  }
}
