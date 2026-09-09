import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { obtenerRutas, desactivarRuta } from "../../services/rutaService";
import "./Rutas.css";

export default function Rutas() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "ADMIN";

  const [rutas, setRutas] = useState([]);
  const [fecha, setFecha] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerRutas();
      setRutas(data);
    } catch {
      setError("No se pudieron cargar las rutas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleDesactivar(ruta) {
    const confirmar = window.confirm(
      `¿Seguro que querés desactivar la ruta "${ruta.nombre}"?`
    );
    if (!confirmar) return;
    try {
      await desactivarRuta(ruta.id);
      cargar();
    } catch {
      alert("No se pudo desactivar la ruta.");
    }
  }

  const rutasVisibles = fecha ? rutas.filter((r) => r.fecha === fecha) : rutas;

  return (
    <div className="rutas-page">
      <div className="page-header">
        <h1>Rutas</h1>
        {esAdmin && (
          <Link to="/rutas/nueva">
            <button className="btn-primario">Nueva ruta</button>
          </Link>
        )}
      </div>

      <div className="page-toolbar">
        <div className="rutas-filtro">
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          {fecha && (
            <button type="button" onClick={() => setFecha("")}>
              Ver todas
            </button>
          )}
        </div>
      </div>

      {error && <p className="estado-error">{error}</p>}

      {cargando ? (
        <p className="estado-cargando">Cargando rutas...</p>
      ) : (
        <div className="tabla-wrapper tabla-responsive-cards">
          <table className="tabla-base">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rutasVisibles.map((ruta) => (
                <tr key={ruta.id} className={!ruta.activa ? "fila-inactiva" : ""}>
                  <td data-label="Fecha">{ruta.fecha}</td>
                  <td data-label="Nombre">
                    <span className="celda-destacada">{ruta.nombre}</span>
                  </td>
                  <td data-label="Estado">
                    <span
                      className={`badge ${
                        ruta.activa ? "badge-activo" : "badge-inactivo"
                      }`}
                    >
                      {ruta.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td data-label="Acciones" className="acciones-fila">
                    <Link to={`/rutas/${ruta.id}`}>Ver detalle</Link>
                    {esAdmin && ruta.activa && (
                      <>
                        <Link to={`/rutas/${ruta.id}/editar`}>Editar</Link>
                        <button onClick={() => handleDesactivar(ruta)}>
                          Desactivar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {rutasVisibles.length === 0 && (
                <tr className="fila-vacia">
                  <td colSpan={4}>No hay rutas para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
