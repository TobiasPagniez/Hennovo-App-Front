import api from "./api";

export function obtenerVehiculosActivos() {
  return api.get("/api/vehiculos").then((res) => res.data);
}
