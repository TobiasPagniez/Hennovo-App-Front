export const TIPO_HUEVO_OPCIONES = [
  { value: "BLANCO", label: "Blanco" },
  { value: "COLOR", label: "Color" },
];

export const TAMAÑO_OPCIONES = [
  { value: "GRANDE", label: "Grande" },
  { value: "MEDIANO", label: "Mediano" },
  { value: "CHICO", label: "Chico" },
  { value: "CHICO_4", label: "Chico 4" },
  { value: "BOLITA", label: "Bolita" },
  { value: "SUPER", label: "Super" },
];

export const PRESENTACION_OPCIONES = [
  { value: "MAPLE", label: "Maple" },
  { value: "CAJON", label: "Cajón" },
  { value: "CAJITA", label: "Cajita" },
  { value: "CAJON_DE_CAJITAS", label: "Cajón de cajitas" },
];

function buscarLabel(opciones, value) {
  return opciones.find((o) => o.value === value)?.label ?? value;
}

export function labelTipoHuevo(value) {
  return buscarLabel(TIPO_HUEVO_OPCIONES, value);
}

export function labelTamaño(value) {
  return buscarLabel(TAMAÑO_OPCIONES, value);
}

export function labelPresentacion(value) {
  return buscarLabel(PRESENTACION_OPCIONES, value);
}
