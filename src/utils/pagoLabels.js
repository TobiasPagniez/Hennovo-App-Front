export const MEDIO_PAGO_OPCIONES = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "CHEQUE", label: "Cheque" },
];

export function labelMedioPago(value) {
  return MEDIO_PAGO_OPCIONES.find((o) => o.value === value)?.label ?? value;
}

export function labelEstadoPedido(estado) {
  const mapa = {
    PENDIENTE: "Pendiente",
    PARCIAL: "Parcial",
    PAGADO: "Pagado",
  };
  return mapa[estado] ?? estado;
}

export function claseEstadoPedido(estado) {
  const mapa = {
    PENDIENTE: "badge-inactivo",
    PARCIAL: "badge-parcial",
    PAGADO: "badge-activo",
  };
  return mapa[estado] ?? "";
}
