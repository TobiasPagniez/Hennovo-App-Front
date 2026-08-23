import api from "./api";

export function obtenerProductosActivos() {
  return api.get("/api/productos").then((res) => res.data);
}

export function obtenerProductoPorId(id) {
  return api.get(`/api/productos/${id}`).then((res) => res.data);
}

export function crearProducto(data) {
  return api.post("/api/productos", data).then((res) => res.data);
}

export function modificarProducto(id, data) {
  return api.put(`/api/productos/${id}`, data).then((res) => res.data);
}

export function desactivarProducto(id) {
  return api.patch(`/api/productos/${id}/desactivar`);
}
