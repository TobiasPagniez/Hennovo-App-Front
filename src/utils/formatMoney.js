export function formatMoney(valor) {
  const numero = Number(valor ?? 0);
  return numero.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
