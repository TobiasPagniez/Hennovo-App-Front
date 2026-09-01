import api from "./api";

export function obtenerPlantillasPorVehiculo(vehiculoId) {
  return api
    .get(`/api/vehiculos/${vehiculoId}/plantillas`)
    .then((res) => res.data);
}

export function configurarCroquis(vehiculoId, data) {
  return api
    .put(`/api/vehiculos/${vehiculoId}/plantillas/configurar`, data)
    .then((res) => res.data);
}

export function agregarDetalleCelda(celdaId, data) {
  return api.post(`/api/plantillas-carga/celdas/${celdaId}/detalles`, data);
}

export function moverDetalleCelda(detalleId, data) {
  return api.put(`/api/plantillas-carga/detalles/${detalleId}/mover`, data);
}

export function actualizarCantidadDetalle(detalleId, data) {
  return api.put(`/api/plantillas-carga/detalles/${detalleId}`, data);
}

export function eliminarDetalleCelda(detalleId) {
  return api.delete(`/api/plantillas-carga/detalles/${detalleId}`);
}
