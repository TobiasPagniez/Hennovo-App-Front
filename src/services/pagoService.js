import api from "./api";

export function obtenerPagosPorCliente(clienteId) {
  return api.get(`/api/pagos/cliente/${clienteId}`).then((res) => res.data);
}

export function crearPago(data) {
  return api.post("/api/pagos", data).then((res) => res.data);
}

export function anularPago(id) {
  return api.patch(`/api/pagos/${id}/anular`);
}
