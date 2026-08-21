import api from "@/lib/api";

export async function getUsers({ search, role, page = 1, pageSize = 20, showDeleted = false } = {}) {
  try {
    return await api.get("/User", { params: { search, role, page, pageSize, showDeleted } });
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

export async function softDeleteUser(userId) {
  try {
    return await api.put(`/User/${encodeURIComponent(userId)}/soft-delete`);
  } catch (error) {
    return error.response;
  }
}

export async function restoreUser(userId) {
  try {
    return await api.put(`/User/${encodeURIComponent(userId)}/restore`);
  } catch (error) {
    return error.response;
  }
}

export async function hardDeleteUser(userId) {
  try {
    return await api.delete(`/User/${encodeURIComponent(userId)}`);
  } catch (error) {
    return error.response;
  }
}