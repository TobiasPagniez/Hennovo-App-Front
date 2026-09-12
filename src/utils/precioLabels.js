export const UNIDAD_PRECIO_OPCIONES = [
  { value: "MAPLE", label: "Maple" },
  { value: "CAJON", label: "Cajón" },
  { value: "CAJITA", label: "Cajita" },
];

export function unidadesPermitidas(producto) {
  if (!producto) return UNIDAD_PRECIO_OPCIONES;

  if (producto.presentacion === "CAJITA") {
    return UNIDAD_PRECIO_OPCIONES.filter((o) => o.value === "CAJITA");
  }

  return UNIDAD_PRECIO_OPCIONES.filter((o) => o.value !== "CAJITA");
}
