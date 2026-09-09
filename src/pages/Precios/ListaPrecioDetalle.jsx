import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { obtenerListaPrecioPorId } from "../../services/listaPrecioService";
import { obtenerProductosTodos } from "../../services/productoService";
import { obtenerCategorias } from "../../services/categoriaClienteService";
import { nombreProducto } from "../../utils/productoNombre";
import "./Precios.css";

export default function ListaPrecioDetalle() {
  const { id } = useParams();
  const [lista, setLista] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    setError(null);
    Promise.all([
      obtenerListaPrecioPorId(id),
      obtenerProductosTodos(),
      obtenerCategorias(),
    ])
      .then(([listaData, productosData, categoriasData]) => {
        setLista(listaData);
        setProductos(productosData);
        setCategorias(categoriasData);
      })
      .catch(() => setError("No se pudo cargar la lista de precios."))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <p className="estado-cargando">Cargando...</p>;
  if (error) return <p className="estado-error">{error}</p>;
  if (!lista) return null;

  function precioDe(productoId, categoriaId) {
    const precio = lista.precios.find(
      (p) => p.productoId === productoId && p.categoriaId === categoriaId
    );
    return precio ? `$ ${precio.precio} (${precio.unidadPrecio})` : "-";
  }

  return (
    <div className="precios-page">
      <div className="page-header">
        <h1>Lista de precios</h1>
        <Link to="/precios">
          <button type="button">Volver</button>
        </Link>
      </div>

      <div className="precios-detalle-info">
        <span>
          <strong>Desde:</strong> {lista.fechaDesde}
        </span>
        <span>
          <strong>Hasta:</strong>{" "}
          {lista.fechaHasta ? lista.fechaHasta : "Vigente"}
        </span>
      </div>

      <div className="precios-grilla-wrapper">
        <table className="precios-grilla">
          <thead>
            <tr>
              <th>Producto</th>
              {categorias.map((cat) => (
                <th key={cat.id}>{cat.nombre}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{nombreProducto(producto)}</td>
                {categorias.map((cat) => (
                  <td key={cat.id}>{precioDe(producto.id, cat.id)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
