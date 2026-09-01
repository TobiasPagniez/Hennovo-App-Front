import api from "./api";

export function obtenerGastos(desde, hasta) {
  const params = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;
  return api.get("/api/gastos", { params }).then((res) => res.data);
}

export function obtenerGastoPorId(id) {
  return api.get(`/api/gastos/${id}`).then((res) => res.data);
}

export function crearGasto(data) {
  return api.post("/api/gastos", data).then((res) => res.data);
}

export function modificarGasto(id, data) {
  return api.put(`/api/gastos/${id}`, data).then((res) => res.data);
}

export function eliminarGasto(id) {
  return api.delete(`/api/gastos/${id}`);
}
