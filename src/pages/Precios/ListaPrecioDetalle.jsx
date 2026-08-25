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
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const [listaData, productosData, categoriasData] = await Promise.all([
          obtenerListaPrecioPorId(id),
          obtenerProductosTodos(),
          obtenerCategorias(),
        ]);
        setLista(listaData);
        setProductos(productosData);
        setCategorias(categoriasData);
      } catch {
        setError("No se pudo cargar la lista de precios.");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id]);

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="precios-error">{error}</p>;
  if (!lista) return null;

  function precioDe(productoId, categoriaId) {
    const precio = lista.precios.find(
      (p) => p.productoId === productoId && p.categoriaId === categoriaId
    );
    return precio ? `$ ${precio.precio} (${precio.unidadPrecio})` : "-";
  }

  return (
    <div className="precios-page">
      <div className="precios-header">
        <h1>
          Lista de precios — desde {lista.fechaDesde}
          {lista.fechaHasta ? ` hasta ${lista.fechaHasta}` : " (vigente)"}
        </h1>
        <Link to="/precios">
          <button type="button">Volver</button>
        </Link>
      </div>

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
  );
}
