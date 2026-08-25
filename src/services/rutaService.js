import api from "./api";

export function obtenerRutas() {
  return api.get("/api/rutas").then((res) => res.data);
}

export function obtenerRutaPorId(id) {
  return api.get(`/api/rutas/${id}`).then((res) => res.data);
}

export function crearRuta(data) {
  return api.post("/api/rutas", data).then((res) => res.data);
}

export function actualizarRuta(id, data) {
  return api.put(`/api/rutas/${id}`, data).then((res) => res.data);
}

export function desactivarRuta(id) {
  return api.patch(`/api/rutas/${id}/desactivar`);
}

export function obtenerPedidosDeRuta(id) {
  return api.get(`/api/rutas/${id}/pedidos`).then((res) => res.data);
}

export function obtenerPedidosDisponibles(fecha) {
  return api
    .get("/api/rutas/pedidos-disponibles", { params: { fecha } })
    .then((res) => res.data);
}

export function asignarPedidos(id, data) {
  return api.put(`/api/rutas/${id}/pedidos`, data).then((res) => res.data);
}

export function quitarPedido(rutaId, pedidoId) {
  return api.delete(`/api/rutas/${rutaId}/pedidos/${pedidoId}`);
}
