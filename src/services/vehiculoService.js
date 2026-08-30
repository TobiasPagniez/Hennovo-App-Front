import api from "./api";

export function obtenerVehiculosActivos() {
  return api.get("/api/vehiculos").then((res) => res.data);
}

export function obtenerVehiculosTodos() {
  return api.get("/api/vehiculos/todos").then((res) => res.data);
}

export function obtenerVehiculoPorId(id) {
  return api.get(`/api/vehiculos/${id}`).then((res) => res.data);
}

export function crearVehiculo(data) {
  return api.post("/api/vehiculos", data).then((res) => res.data);
}

export function actualizarVehiculo(id, data) {
  return api.put(`/api/vehiculos/${id}`, data).then((res) => res.data);
}

export function desactivarVehiculo(id) {
  return api.patch(`/api/vehiculos/${id}/desactivar`);
}

export function reactivarVehiculo(id) {
  return api.patch(`/api/vehiculos/${id}/reactivar`).then((res) => res.data);
}

export function actualizarKilometraje(id, data) {
  return api
    .patch(`/api/vehiculos/${id}/kilometraje`, data)
    .then((res) => res.data);
}

export function obtenerHistorialKilometraje(id) {
  return api
    .get(`/api/vehiculos/${id}/kilometraje/historial`)
    .then((res) => res.data);
}

export function obtenerVencimientos(diasAnticipacion = 15) {
  return api
    .get("/api/vehiculos/vencimientos", { params: { diasAnticipacion } })
    .then((res) => res.data);
}
