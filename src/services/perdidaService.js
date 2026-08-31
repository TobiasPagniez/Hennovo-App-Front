import api from "./api";

export function obtenerPerdidas(desde, hasta) {
  const params = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;
  return api.get("/api/perdidas", { params }).then((res) => res.data);
}

export function obtenerPerdidaPorId(id) {
  return api.get(`/api/perdidas/${id}`).then((res) => res.data);
}

export function crearPerdida(data) {
  return api.post("/api/perdidas", data).then((res) => res.data);
}

export function modificarPerdida(id, data) {
  return api.put(`/api/perdidas/${id}`, data).then((res) => res.data);
}

export function eliminarPerdida(id) {
  return api.delete(`/api/perdidas/${id}`);
}
