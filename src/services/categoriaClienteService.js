import api from "./api";

export function obtenerCategorias() {
  return api.get("/api/categorias-clientes").then((res) => res.data);
}

export function crearCategoria(data) {
  return api.post("/api/categorias-clientes", data).then((res) => res.data);
}

export function modificarCategoria(id, data) {
  return api
    .put(`/api/categorias-clientes/${id}`, data)
    .then((res) => res.data);
}

export function eliminarCategoria(id) {
  return api.delete(`/api/categorias-clientes/${id}`);
}
