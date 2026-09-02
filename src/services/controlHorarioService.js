import api from "./api";

export function obtenerMisRegistros() {
  return api.get("/api/control-horario/mios").then((res) => res.data);
}

export function obtenerTodosLosRegistros(desde, hasta) {
  return api
    .get("/api/control-horario", { params: { desde, hasta } })
    .then((res) => res.data);
}

export function obtenerRegistrosPorUsuario(usuarioId, desde, hasta) {
  return api
    .get(`/api/control-horario/usuario/${usuarioId}`, {
      params: { desde, hasta },
    })
    .then((res) => res.data);
}

export function obtenerResumenPorUsuario(desde, hasta) {
  return api
    .get("/api/control-horario/resumen", { params: { desde, hasta } })
    .then((res) => res.data);
}

export function crearRegistro(data) {
  return api.post("/api/control-horario", data).then((res) => res.data);
}

export function actualizarRegistro(id, data) {
  return api.put(`/api/control-horario/${id}`, data).then((res) => res.data);
}

export function eliminarRegistro(id) {
  return api.delete(`/api/control-horario/${id}`);
}
