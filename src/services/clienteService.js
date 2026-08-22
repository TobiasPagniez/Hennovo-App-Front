import api from "./api";

export function obtenerClientes() {
  return api.get("/api/clientes").then((res) => res.data);
}

export function buscarClientesPorNombre(nombre) {
  return api
    .get("/api/clientes/buscar", { params: { nombre } })
    .then((res) => res.data);
}

export function obtenerClientePorId(id) {
  return api.get(`/api/clientes/${id}`).then((res) => res.data);
}

export function crearCliente(data) {
  return api.post("/api/clientes", data).then((res) => res.data);
}

export function modificarCliente(id, data) {
  return api.put(`/api/clientes/${id}`, data).then((res) => res.data);
}

export function desactivarCliente(id) {
  return api.patch(`/api/clientes/${id}/desactivar`);
}
