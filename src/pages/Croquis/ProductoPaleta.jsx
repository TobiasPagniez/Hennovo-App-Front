import { nombreProducto } from "../../utils/productoNombre";

export default function ProductoPaleta({ productos, productoSeleccionado, onSeleccionar }) {
  return (
    <div className="croquis-paleta">
      <h3>Productos</h3>
      <p className="croquis-paleta-ayuda">
        Tocá un producto y después tocá la celda donde va.
      </p>
      <div className="croquis-paleta-lista">
        {productos.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`croquis-paleta-item ${
              productoSeleccionado?.id === p.id ? "seleccionado" : ""
            }`}
            onClick={() =>
              onSeleccionar(productoSeleccionado?.id === p.id ? null : p)
            }
          >
            {nombreProducto(p)}
          </button>
        ))}
      </div>
    </div>
  );
}
