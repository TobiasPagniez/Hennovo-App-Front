import api from "./api";

export function obtenerUsuarios() {
  return api.get("/api/users").then((res) => res.data);
}

export function obtenerEmpleados() {
  return api.get("/api/users/empleados").then((res) => res.data);
}
