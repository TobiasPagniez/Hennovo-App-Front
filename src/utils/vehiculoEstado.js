const DIAS_ANTICIPACION = 15;
const UMBRAL_KM = 1000;

// Devuelve: "vencido" | "proximo" | "ok"
function estadoFecha(fechaISO) {
  if (!fechaISO) return "ok";
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(fechaISO + "T00:00:00");
  const diffDias = Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24));

  if (diffDias < 0) return "vencido";
  if (diffDias <= DIAS_ANTICIPACION) return "proximo";
  return "ok";
}

function estadoKm(kilometrajeActual, kilometrajeObjetivo) {
  if (!kilometrajeObjetivo) return "ok";
  const restante = kilometrajeObjetivo - kilometrajeActual;

  if (restante <= 0) return "vencido";
  if (restante <= UMBRAL_KM) return "proximo";
  return "ok";
}

const PEOR = { ok: 0, proximo: 1, vencido: 2 };

function peorEstado(...estados) {
  return estados.reduce((peor, actual) =>
    PEOR[actual] > PEOR[peor] ? actual : peor
  );
}

// Estado general del vehículo (para colorear la fila completa)
export function estadoGeneralVehiculo(vehiculo) {
  return peorEstado(
    estadoFecha(vehiculo.proximoServiceFecha),
    estadoFecha(vehiculo.vencimientoSeguro),
    estadoFecha(vehiculo.vencimientoItv),
    estadoFecha(vehiculo.vencimientoSenasa),
    estadoKm(vehiculo.kilometrajeActual, vehiculo.proximoCambioAceiteKm),
    estadoKm(vehiculo.kilometrajeActual, vehiculo.proximaRotacionAlineadoKm),
    estadoKm(vehiculo.kilometrajeActual, vehiculo.proximoCambioCorreaKm)
  );
}

// Estado de un campo puntual (para colorear la celda individual)
export function estadoDeFecha(fechaISO) {
  return estadoFecha(fechaISO);
}

export function estadoDeKm(kilometrajeActual, kilometrajeObjetivo) {
  return estadoKm(kilometrajeActual, kilometrajeObjetivo);
}
