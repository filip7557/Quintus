import api from "@/lib/api";

export async function postContact({ fullName, email, message }) {
  try {
    const response = await api.post("/Contact", {
      FullName: String(fullName ?? "").trim(),
      Email: String(email ?? "").trim(),
      Message: String(message ?? "").trim(),
    });
    return response;
  } catch (error) {
    return error?.response;
  }
}
