import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { obtenerProductosActivos } from "../../services/productoService";
import { obtenerCategorias } from "../../services/categoriaClienteService";
import {
  obtenerListaPrecioPorId,
  actualizarListaPrecio,
} from "../../services/listaPrecioService";
import { nombreProducto } from "../../utils/productoNombre";
import "./NuevaListaPrecio.css";

function claveCelda(productoId, categoriaId) {
  return `${productoId}-${categoriaId}`;
}

export default function EditarListaPrecio() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lista, setLista] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);

  const [precios, setPrecios] = useState({});

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError(null);

      try {
        const [listaData, productosData, categoriasData] =
          await Promise.all([
            obtenerListaPrecioPorId(id),
            obtenerProductosActivos(),
            obtenerCategorias(),
          ]);

        setLista(listaData);
        setProductos(productosData);
        setCategorias(categoriasData);

        const preciosIniciales = {};

        for (const precio of listaData.precios) {
          preciosIniciales[
            claveCelda(precio.productoId, precio.categoriaId)
          ] = String(precio.precio);
        }

        setPrecios(preciosIniciales);
      } catch {
        setError("No se pudo cargar la lista de precios.");
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, [id]);

  function handlePrecioChange(productoId, categoriaId, valor) {
    setPrecios((prev) => ({
      ...prev,
      [claveCelda(productoId, categoriaId)]: valor,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorEnvio(null);

    const preciosPayload = [];

    for (const producto of productos) {
      for (const categoria of categorias) {
        const clave = claveCelda(producto.id, categoria.id);
        const valor = precios[clave];

        if (valor === undefined || valor === "") {
          continue;
        }

        const numero = Number(valor);

        if (isNaN(numero) || numero <= 0) {
          setErrorEnvio(
            `El precio de "${nombreProducto(producto)}" para la categoría "${categoria.nombre}" no es válido.`,
          );
          return;
        }

        preciosPayload.push({
          productoId: producto.id,
          categoriaId: categoria.id,
          precio: numero,
        });
      }
    }

    if (preciosPayload.length === 0) {
      setErrorEnvio("Tenés que tener al menos un precio.");
      return;
    }

    setEnviando(true);

    try {
      await actualizarListaPrecio(id, {
        // Las fechas se mandan como están en la lista.
        fechaDesde: lista.fechaDesde,
        fechaHasta: lista.fechaHasta || null,
        precios: preciosPayload,
      });

      navigate(`/precios/${id}`);
    } catch (err) {
      setErrorEnvio(
        err.response?.data?.detail ||
          "Ocurrió un error al actualizar la lista de precios.",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return <p className="estado-cargando">Cargando lista de precios...</p>;
  }

  if (error) {
    return <p className="estado-error">{error}</p>;
  }

  if (!lista) {
    return null;
  }

  return (
    <div className="nueva-lista-page">
      <div className="page-header">
        <h1>Editar lista de precios</h1>

        <Link to={`/precios/${id}`}>
          <button type="button">Volver</button>
        </Link>
      </div>

      <div className="nueva-lista-fechas">
        <div>
          <label>Vigente desde</label>
          <input
            type="date"
            value={lista.fechaDesde}
            disabled
            readOnly
          />
        </div>

        <div>
          <label>Vigente hasta</label>
          <input
            type="date"
            value={lista.fechaHasta || ""}
            disabled
            readOnly
          />
        </div>
      </div>

      <p className="nueva-lista-aviso">
        Modificá los precios que necesites. Las fechas de vigencia no se
        pueden modificar desde esta pantalla.
      </p>

      <form onSubmit={handleSubmit} className="nueva-lista-form">
        <div className="precios-grilla-wrapper">
          <table className="precios-grilla nueva-lista-grilla">
            <thead>
              <tr>
                <th>Producto</th>

                {categorias.map((categoria) => (
                  <th key={categoria.id}>
                    {categoria.nombre}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{nombreProducto(producto)}</td>

                  {categorias.map((categoria) => (
                    <td key={categoria.id}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          precios[
                            claveCelda(
                              producto.id,
                              categoria.id
                            )
                          ] ?? ""
                        }
                        onChange={(e) =>
                          handlePrecioChange(
                            producto.id,
                            categoria.id,
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

        {errorEnvio && (
          <p className="form-error-api">
            {errorEnvio}
          </p>
        )}

        <div className="form-actions">
          <Link to={`/precios/${id}`}>
            <button type="button" disabled={enviando}>
              Cancelar
            </button>
          </Link>

          <button
            type="submit"
            className="btn-primario"
            disabled={enviando}
          >
            {enviando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
