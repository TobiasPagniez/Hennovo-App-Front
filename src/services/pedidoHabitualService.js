import api from "./api";

export function obtenerHabitualesPorCliente(idCliente) {
  return api
    .get(`/api/pedidos-habituales/cliente/${idCliente}`)
    .then((res) => res.data);
}
