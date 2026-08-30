import api from "./api";

export function obtenerCheques() {
  return api.get("/api/cheques").then((res) => res.data);
}

export function obtenerChequePorId(id) {
  return api.get(`/api/cheques/${id}`).then((res) => res.data);
}

export function crearCheque(data) {
  return api.post("/api/cheques", data).then((res) => res.data);
}

export function modificarCheque(id, data) {
  return api.put(`/api/cheques/${id}`, data).then((res) => res.data);
}

export function desactivarCheque(id) {
  return api.patch(`/api/cheques/${id}/desactivar`);
}

export function reactivarCheque(id) {
  return api.patch(`/api/cheques/${id}/reactivar`).then((res) => res.data);
}
