import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  obtenerListasPrecio,
  obtenerListaVigente,
} from "../../services/listaPrecioService";
import "./Precios.css";

export default function Precios() {
  const [listas, setListas] = useState([]);
  const [vigente, setVigente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const [todasLasListas, listaVigente] = await Promise.all([
          obtenerListasPrecio(),
          obtenerListaVigente().catch(() => null), // puede no existir todavía
        ]);
        setListas(todasLasListas);
        setVigente(listaVigente);
      } catch {
        setError("No se pudieron cargar las listas de precio.");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const historicas = listas.filter((l) => l.id !== vigente?.id);

  return (
    <div className="precios-page">
      <div className="precios-header">
        <h1>Listas de precio</h1>
        <Link to="/precios/nueva">
          <button>Nueva lista de precios</button>
        </Link>
      </div>

      {error && <p className="precios-error">{error}</p>}

      {cargando ? (
        <p>Cargando listas de precio...</p>
      ) : (
        <>
          <section className="precios-vigente">
            <h2>Lista vigente</h2>
            {vigente ? (
              <table className="precios-tabla">
                <thead>
                  <tr>
                    <th>Vigente desde</th>
                    <th>Cantidad de precios</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{vigente.fechaDesde}</td>
                    <td>{vigente.precios.length}</td>
                    <td>
                      <Link to={`/precios/${vigente.id}`}>Ver detalle</Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p>No hay una lista de precios vigente todavía.</p>
            )}
          </section>

          <section className="precios-historial">
            <h2>Historial</h2>
            {historicas.length === 0 ? (
              <p>No hay listas anteriores.</p>
            ) : (
              <table className="precios-tabla">
                <thead>
                  <tr>
                    <th>Desde</th>
                    <th>Hasta</th>
                    <th>Cantidad de precios</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {historicas
                    .sort((a, b) => (a.fechaDesde < b.fechaDesde ? 1 : -1))
                    .map((lista) => (
                      <tr key={lista.id}>
                        <td>{lista.fechaDesde}</td>
                        <td>{lista.fechaHasta ?? "-"}</td>
                        <td>{lista.precios.length}</td>
                        <td>
                          <Link to={`/precios/${lista.id}`}>Ver detalle</Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
