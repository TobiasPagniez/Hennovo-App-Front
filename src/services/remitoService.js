import api from "./api";

export function obtenerRemitos() {
  return api.get("/api/remitos").then((res) => res.data);
}

export function obtenerRemitoPorId(id) {
  return api.get(`/api/remitos/${id}`).then((res) => res.data);
}

export function obtenerRemitoPorPedido(pedidoId) {
  return api.get(`/api/remitos/pedido/${pedidoId}`).then((res) => res.data);
}

export function crearRemito(data) {
  return api.post("/api/remitos", data).then((res) => res.data);
}

export function descargarRemitoPdf(id) {
  return api
    .get(`/api/remitos/${id}/pdf`, { responseType: "blob" })
    .then((res) => res.data);
}
