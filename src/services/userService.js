import api from "./api";

export function obtenerUsuarios() {
  return api.get("/api/users").then((res) => res.data);
}
