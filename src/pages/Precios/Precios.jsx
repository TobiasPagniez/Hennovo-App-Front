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
          obtenerListaVigente().catch(() => null),
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
      <div className="page-header">
        <h1>Listas de precio</h1>
        <Link to="/precios/nueva">
          <button className="btn-primario">Nueva lista de precios</button>
        </Link>
      </div>

      {error && <p className="estado-error">{error}</p>}

      {cargando ? (
        <p className="estado-cargando">Cargando listas de precio...</p>
      ) : (
        <>
          <section>
            <h2 className="precios-seccion-titulo">Lista vigente</h2>
            {vigente ? (
              <div className="tabla-wrapper tabla-responsive-cards">
                <table className="tabla-base">
                  <thead>
                    <tr>
                      <th>Vigente desde</th>
                      <th>Cantidad de precios</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td data-label="Vigente desde">
                        <span className="celda-destacada">
                          {vigente.fechaDesde}
                        </span>
                      </td>
                      <td data-label="Cantidad de precios">
                        {vigente.precios.length}
                      </td>
                      <td data-label="Acciones" className="acciones-fila">
                        <Link to={`/precios/${vigente.id}`}>Ver detalle</Link>
                        <Link to={`/precios/${vigente.id}/editar`}>
                          Editar
                        </Link>{" "}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="precios-vacio">
                No hay una lista de precios vigente todavía.
              </p>
            )}
          </section>

          <section>
            <h2 className="precios-seccion-titulo">Historial</h2>
            {historicas.length === 0 ? (
              <p className="precios-vacio">No hay listas anteriores.</p>
            ) : (
              <div className="tabla-wrapper tabla-responsive-cards">
                <table className="tabla-base">
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
                          <td data-label="Desde">{lista.fechaDesde}</td>
                          <td data-label="Hasta">{lista.fechaHasta ?? "-"}</td>
                          <td data-label="Cantidad de precios">
                            {lista.precios.length}
                          </td>
                          <td data-label="Acciones" className="acciones-fila">
                            <Link to={`/precios/${lista.id}`}>Ver detalle</Link>
                            <Link to={`/precios/${lista.id}/editar`}>
                              Editar
                            </Link>{" "}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
