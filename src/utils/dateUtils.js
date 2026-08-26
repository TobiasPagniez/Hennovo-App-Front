const DIAS_SEMANA = [
  { indice: 1, label: "Lunes" },
  { indice: 2, label: "Martes" },
  { indice: 3, label: "Miércoles" },
  { indice: 4, label: "Jueves" },
  { indice: 5, label: "Viernes" },
  { indice: 6, label: "Sábado" },
];

export { DIAS_SEMANA };

function toISO(date) {
  return date.toISOString().split("T")[0];
}

// Dada cualquier fecha, devuelve el Lunes de esa semana (como Date, hora local)
export function lunesDeLaSemana(fechaISO) {
  const fecha = new Date(fechaISO + "T00:00:00");
  const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, ...6=sabado
  const offset = diaSemana === 0 ? -6 : 1 - diaSemana; // si es domingo, retrocede 6
  const lunes = new Date(fecha);
  lunes.setDate(fecha.getDate() + offset);
  return lunes;
}

// Devuelve un array de 6 fechas ISO (Lunes a Sábado) a partir de una fecha cualquiera de esa semana
export function fechasDeLaSemana(fechaISO) {
  const lunes = lunesDeLaSemana(fechaISO);
  return DIAS_SEMANA.map((_, index) => {
    const dia = new Date(lunes);
    dia.setDate(lunes.getDate() + index);
    return toISO(dia);
  });
}

export function hoyISO() {
  return toISO(new Date());
}
