import api from "@/lib/api";

export async function getAppointments(weekStart, weekEnd) {
  try {
    return await api.get("/Appointment", { params: { weekStart, weekEnd } });
  } catch (error) {
    return error.response;
  }
}

export async function getPendingAppointments() {
  try {
    return await api.get("/Appointment/pending");
  } catch (error) {
    return error.response;
  }
}

export async function getAppointmentById(id) {
  try {
    return await api.get(`/Appointment/${encodeURIComponent(id)}`);
  } catch (error) {
    return error.response;
  }
}

export async function createAppointment(data) {
  try {
    return await api.post("/Appointment", data);
  } catch (error) {
    return error.response;
  }
}

export async function updateAppointment(id, data) {
  try {
    return await api.put(`/Appointment/${encodeURIComponent(id)}`, data);
  } catch (error) {
    return error.response;
  }
}

export async function transferAppointmentOwner(id, ownerUserId) {
  try {
    return await api.put(`/Appointment/${encodeURIComponent(id)}/owner`, { ownerUserId });
  } catch (error) {
    return error.response;
  }
}

export async function deleteAppointment(id) {
  try {
    return await api.delete(`/Appointment/${encodeURIComponent(id)}`);
  } catch (error) {
    return error.response;
  }
}