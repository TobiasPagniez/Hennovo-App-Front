import { nombreProducto } from "../../utils/productoNombre";

export default function CroquisGrid({
  plantilla,
  productosPorId,
  productoSeleccionado,
  chipParaMover,
  onClickCelda,
  onClickChip,
}) {
  const filas = [];
  for (let f = 1; f <= plantilla.filas; f++) {
    const celdasFila = plantilla.celdas
      .filter((c) => c.fila === f)
      .sort((a, b) => a.columna - b.columna);
    filas.push(celdasFila);
  }

  const modoColocar = !!productoSeleccionado || !!chipParaMover;

  return (
    <div className="croquis-grid-wrapper">
      <table className="croquis-grid">
        <tbody>
          {filas.map((celdasFila, index) => (
            <tr key={index}>
              {celdasFila.map((celda) => (
                <td
                  key={celda.id}
                  className={`croquis-celda ${
                    modoColocar ? "croquis-celda-activa" : ""
                  }`}
                  onClick={() => modoColocar && onClickCelda(celda.id)}
                >
                  <div className="croquis-celda-contenido">
                    {celda.detalles.map((detalle) => {
                      const producto = productosPorId[detalle.productoId];
                      const enMovimiento = chipParaMover?.id === detalle.id;
                      return (
                        <div
                          key={detalle.id}
                          className={`croquis-chip ${
                            enMovimiento ? "croquis-chip-moviendo" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClickChip(detalle, producto);
                          }}
                          title={producto ? nombreProducto(producto) : ""}
                        >
                          <strong>{detalle.cantidad}</strong>{" "}
                          {producto ? nombreProducto(producto) : "?"}
                        </div>
                      );
                    })}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
