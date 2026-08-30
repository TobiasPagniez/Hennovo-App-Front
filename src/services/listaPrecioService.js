import api from "./api";

export function obtenerListasPrecio() {
  return api.get("/api/listas-precio").then((res) => res.data);
}

export function obtenerListaPrecioPorId(id) {
  return api.get(`/api/listas-precio/${id}`).then((res) => res.data);
}

export function obtenerListaVigente() {
  return api.get("/api/listas-precio/vigente").then((res) => res.data);
}

export function crearListaPrecio(data) {
  return api.post("/api/listas-precio", data).then((res) => res.data);
}
