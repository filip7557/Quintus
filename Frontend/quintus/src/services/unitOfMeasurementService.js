import api from "@/lib/api";

export async function getUnitsOfMeasurement() {
  const response = await api.get("/UnitOfMeasurement");
  return response.data;
}

export async function createUnitOfMeasurement(name) {
  const response = await api.post("/UnitOfMeasurement", JSON.stringify(name), {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function deleteUnitOfMeasurement(id) {
  await api.delete(`/UnitOfMeasurement/${id}`);
}
