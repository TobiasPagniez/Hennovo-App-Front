import api from "./api";

export function obtenerPedidos({
  fecha,
  buscar,
  pagina = 0,
  tamano = 10,
} = {}) {
  const params = {
    page: pagina,
    size: tamano,
  };

  if (fecha) {
    params.fecha = fecha;
  }

  if (buscar?.trim()) {
    params.buscar = buscar.trim();
  }

  return api.get("/api/pedidos", { params }).then((res) => res.data);
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

export function asignarUsuarioPedido(id, usuarioId) {
  return api
    .patch(`/api/pedidos/${id}/asignar`, { usuarioId })
    .then((res) => res.data);
}
