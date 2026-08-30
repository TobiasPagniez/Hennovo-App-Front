import api from "./api";

export function obtenerCuentaCorriente(clienteId) {
  return api
    .get(`/api/clientes/${clienteId}/cuenta-corriente`)
    .then((res) => res.data);
}
