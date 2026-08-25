import api from "./api";

export function obtenerPedidos(fecha) {
  return api
    .get("/api/pedidos", { params: fecha ? { fecha } : {} })
    .then((res) => res.data);
}

export function obtenerPedidoPorId(id) {
  return api.get(`/api/pedidos/${id}`).then((res) => res.data);
}

export function crearPedido(data) {
  return api.post("/api/pedidos", data).then((res) => res.data);
}

export function actualizarPedido(id, data) {
  return api.put(`/api/pedidos/${id}`, data).then((res) => res.data);
}

export function marcarEntregado(id) {
  return api.patch(`/api/pedidos/${id}/entregado`);
}

export function marcarPagado(id) {
  return api.patch(`/api/pedidos/${id}/pagado`);
}
