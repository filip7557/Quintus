import api from "@/lib/api";

export async function getUsers({ search, role, page = 1, pageSize = 20 } = {}) {
  try {
    return await api.get("/User", { params: { search, role, page, pageSize } });
  } catch (error) {
    return error.response;
  }
}

export async function getRoles() {
  try {
    return await api.get("/User/roles");
  } catch (error) {
    return error.response;
  }
}

export async function getAppointmentOwners() {
  try {
    return await api.get("/User/appointment-owners");
  } catch (error) {
    return error.response;
  }
}

export async function assignUserRole(userId, roleId) {
  try {
    return await api.put(`/User/${encodeURIComponent(userId)}/role`, { roleId });
  } catch (error) {
    return error.response;
  }
}

export async function updateUserColor(userId, color) {
  try {
    return await api.put(`/User/${encodeURIComponent(userId)}/color`, { color });
  } catch (error) {
    return error.response;
  }
}