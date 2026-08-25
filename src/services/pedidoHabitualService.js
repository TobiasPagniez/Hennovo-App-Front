import api from "./api";

export function obtenerHabitualesPorCliente(idCliente) {
  return api
    .get(`/api/pedidos-habituales/cliente/${idCliente}`)
    .then((res) => res.data);
}

export function crearHabitual(data) {
  return api.post("/api/pedidos-habituales", data).then((res) => res.data);
}

export function modificarHabitual(id, data) {
  return api
    .put(`/api/pedidos-habituales/${id}`, data)
    .then((res) => res.data);
}

export function eliminarHabitual(id) {
  return api.delete(`/api/pedidos-habituales/${id}`);
}
