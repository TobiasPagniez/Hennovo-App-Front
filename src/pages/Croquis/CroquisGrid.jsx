import { nombreProducto } from "../../utils/productoNombre";

export default function CroquisGrid({
  plantilla,
  productosPorId,
  onDropProducto,
  onDropDetalle,
  onClickChip,
}) {
  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e, celdaId) {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const data = JSON.parse(raw);

    if (data.tipo === "producto") {
      onDropProducto(celdaId, data.productoId);
    } else if (data.tipo === "detalle") {
      onDropDetalle(celdaId, data.detalleId);
    }
  }

  function handleDragStartChip(e, detalle) {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ tipo: "detalle", detalleId: detalle.id })
    );
  }

  // Ordenamos las celdas en una matriz [fila][columna] para renderizar filas reales
  const filas = [];
  for (let f = 1; f <= plantilla.filas; f++) {
    const celdasFila = plantilla.celdas
      .filter((c) => c.fila === f)
      .sort((a, b) => a.columna - b.columna);
    filas.push(celdasFila);
  }

  return (
    <div className="croquis-grid-wrapper">
      <table className="croquis-grid">
        <tbody>
          {filas.map((celdasFila, index) => (
            <tr key={index}>
              {celdasFila.map((celda) => (
                <td
                  key={celda.id}
                  className="croquis-celda"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, celda.id)}
                >
                  {celda.detalles.map((detalle) => {
                    const producto = productosPorId[detalle.productoId];
                    return (
                      <div
                        key={detalle.id}
                        className="croquis-chip"
                        draggable
                        onDragStart={(e) => handleDragStartChip(e, detalle)}
                        onClick={() => onClickChip(detalle, producto)}
                        title={producto ? nombreProducto(producto) : ""}
                      >
                        <strong>{detalle.cantidad}</strong>{" "}
                        {producto ? nombreProducto(producto) : "?"}
                      </div>
                    );
                  })}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
