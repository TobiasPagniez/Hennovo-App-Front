import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { obtenerProductosActivos } from "../../services/productoService";
import { obtenerCategorias } from "../../services/categoriaClienteService";
import {
  obtenerListaVigente,
  crearListaPrecio,
} from "../../services/listaPrecioService";
import { nombreProducto } from "../../utils/productoNombre";
import "./NuevaListaPrecio.css";

function claveCelda(productoId, categoriaId) {
  return `${productoId}-${categoriaId}`;
}

export default function NuevaListaPrecio() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [precios, setPrecios] = useState({}); // { "productoId-categoriaId": "1234" }
  const [unidades, setUnidades] = useState({}); // { productoId: "MAPLE" | "CAJON" }

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const [productosData, categoriasData, vigente] = await Promise.all([
          obtenerProductosActivos(),
          obtenerCategorias(),
          obtenerListaVigente().catch(() => null),
        ]);

        setProductos(productosData);
        setCategorias(categoriasData);

        if (vigente) {
          const preciosIniciales = {};
          const unidadesIniciales = {};

          for (const precio of vigente.precios) {
            preciosIniciales[
              claveCelda(precio.productoId, precio.categoriaId)
            ] = String(precio.precio);

            // Asumimos unidad fija por producto: tomamos la primera que aparezca.
            if (!unidadesIniciales[precio.productoId]) {
              unidadesIniciales[precio.productoId] = precio.unidadPrecio;
            }
          }

          setPrecios(preciosIniciales);
          setUnidades(unidadesIniciales);
        }
      } catch {
        setError("No se pudieron cargar los datos necesarios.");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  function handlePrecioChange(productoId, categoriaId, valor) {
    setPrecios((prev) => ({
      ...prev,
      [claveCelda(productoId, categoriaId)]: valor,
    }));
  }

  function handleUnidadChange(productoId, valor) {
    setUnidades((prev) => ({ ...prev, [productoId]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorEnvio(null);

    if (!fechaDesde) {
      setErrorEnvio("La fecha desde es obligatoria.");
      return;
    }

    const preciosPayload = [];

    for (const producto of productos) {
      for (const categoria of categorias) {
        const clave = claveCelda(producto.id, categoria.id);
        const valor = precios[clave];

        if (valor === undefined || valor === "") continue;

        const numero = Number(valor);
        if (isNaN(numero) || numero <= 0) {
          setErrorEnvio(
            `El precio de "${nombreProducto(producto)}" para la categoría "${categoria.nombre}" no es válido.`
          );
          return;
        }

        const unidad = unidades[producto.id];
        if (!unidad) {
          setErrorEnvio(
            `Falta indicar la unidad de precio (Maple/Cajón) para "${nombreProducto(producto)}".`
          );
          return;
        }

        preciosPayload.push({
          productoId: producto.id,
          categoriaId: categoria.id,
          precio: numero,
          unidadPrecio: unidad,
        });
      }
    }

    if (preciosPayload.length === 0) {
      setErrorEnvio("Tenés que cargar al menos un precio.");
      return;
    }

    setEnviando(true);
    try {
      await crearListaPrecio({
        fechaDesde,
        fechaHasta: fechaHasta || null,
        precios: preciosPayload,
      });
      navigate("/precios");
    } catch (err) {
      setErrorEnvio(
        err.response?.data?.detail ||
          "Ocurrió un error al guardar la lista de precios."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <p className="estado-cargando">Cargando datos...</p>;
  if (error) return <p className="estado-error">{error}</p>;

  return (
    <div className="nueva-lista-page">
      <div className="page-header">
        <h1>Nueva lista de precios</h1>
        <Link to="/precios">
          <button type="button">Volver</button>
        </Link>
      </div>

      <p className="nueva-lista-aviso">
        Al guardar, esta lista pasará a ser la vigente y la lista anterior se
        cerrará automáticamente. Los campos vacíos no se guardan como precio.
      </p>

      <form onSubmit={handleSubmit} className="nueva-lista-form">
        <div className="nueva-lista-fechas">
          <div>
            <label>Vigente desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Vigente hasta (opcional)</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
        </div>

        <div className="precios-grilla-wrapper">
          <table className="precios-grilla nueva-lista-grilla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Unidad</th>
                {categorias.map((cat) => (
                  <th key={cat.id}>{cat.nombre}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{nombreProducto(producto)}</td>
                  <td>
                    <select
                      value={unidades[producto.id] ?? ""}
                      onChange={(e) =>
                        handleUnidadChange(producto.id, e.target.value)
                      }
                    >
                      <option value="">-</option>
                      <option value="MAPLE">Maple</option>
                      <option value="CAJON">Cajón</option>
                    </select>
                  </td>
                  {categorias.map((cat) => (
                    <td key={cat.id}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={precios[claveCelda(producto.id, cat.id)] ?? ""}
                        onChange={(e) =>
                          handlePrecioChange(
                            producto.id,
                            cat.id,
                            e.target.value
                          )
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {errorEnvio && <p className="form-error-api">{errorEnvio}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-primario" disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar lista de precios"}
          </button>
        </div>
      </form>
    </div>
  );
}
