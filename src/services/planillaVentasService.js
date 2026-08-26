import api from "./api";

export function obtenerPlanillaVentas(fecha) {
  return api
    .get("/api/planilla-ventas", { params: { fecha } })
    .then((res) => res.data);
}
