import api from "./api";

export function obtenerPlanillaVentas(usuarioId, fecha) {
  return api
    .get("/api/planilla-ventas", { params: { usuarioId, fecha } })
    .then((res) => res.data);
}

export function guardarOrdenPlanilla(data) {
  return api.put("/api/planilla-ventas/orden", data);
}
