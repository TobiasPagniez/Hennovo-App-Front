import api from "./api";

export function obtenerUsuarios() {
  return api.get("/api/users").then((res) => res.data);
}

export function obtenerUsuarioPorId(id) {
  return api.get(`/api/users/${id}`).then((res) => res.data);
}

export function crearUsuario(data) {
  return api.post("/api/users", data).then((res) => res.data);
}

export function modificarUsuario(id, data) {
  return api.put(`/api/users/${id}`, data).then((res) => res.data);
}

export function desactivarUsuario(id) {
  return api.patch(`/api/users/${id}/deactivate`);
}
export function cambiarPassword(data) {
  return api.patch("/api/users/me/password", data);
}
