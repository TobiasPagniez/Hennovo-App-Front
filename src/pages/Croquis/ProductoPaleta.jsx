import { nombreProducto } from "../../utils/productoNombre";

export default function ProductoPaleta({ productos }) {
  function handleDragStart(e, producto) {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ tipo: "producto", productoId: producto.id })
    );
  }

  return (
    <div className="croquis-paleta">
      <h3>Productos</h3>
      <p className="croquis-paleta-ayuda">
        Arrastrá un producto hacia una celda del croquis.
      </p>
      <div className="croquis-paleta-lista">
        {productos.map((p) => (
          <div
            key={p.id}
            className="croquis-paleta-item"
            draggable
            onDragStart={(e) => handleDragStart(e, p)}
          >
            {nombreProducto(p)}
          </div>
        ))}
      </div>
    </div>
  );
}
