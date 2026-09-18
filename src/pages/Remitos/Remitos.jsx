import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerRemitos, descargarRemitoPdf } from "../../services/remitoService";
import { descargarArchivo } from "../../utils/downloadFile";
import { formatMoney } from "../../utils/formatMoney";
import { useDialogo } from "../../context/DialogoContext";
import "./Remitos.css";

export default function Remitos() {
  const { avisar } = useDialogo();
  const [remitos, setRemitos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [descargandoId, setDescargandoId] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerRemitos();
      setRemitos(data.sort((a, b) => (a.fecha < b.fecha ? 1 : -1)));
    } catch {
      setError("No se pudieron cargar los remitos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleDescargar(remito) {
    setDescargandoId(remito.id);
    try {
      const blob = await descargarRemitoPdf(remito.id);
      descargarArchivo(blob, `remito-${remito.id}.pdf`);
    } catch {
      await avisar("No se pudo descargar el PDF del remito.", { peligro: true });
    } finally {
      setDescargandoId(null);
    }
  }

  return (
    <div className="remitos-page">
      <div className="page-header">
        <h1>Remitos</h1>
        <Link to="/remitos/nuevo">
          <button className="btn-primario">Nuevo remito</button>
        </Link>
      </div>

      {error && <p className="estado-error">{error}</p>}

      {cargando ? (
        <p className="estado-cargando">Cargando remitos...</p>
      ) : (
        <div className="tabla-wrapper tabla-responsive-cards">
          <table className="tabla-base">
            <thead>
              <tr>
                <th>N°</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Facturación</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {remitos.map((r) => (
                <tr key={r.id}>
                  <td data-label="N°">
                    <span className="celda-destacada">
                      {String(r.id).padStart(6, "0")}
                    </span>
                  </td>
                  <td data-label="Fecha">{r.fecha}</td>
                  <td data-label="Cliente">{r.clienteNombre}</td>
                  <td data-label="Facturación">
                    <span
                      className={`badge ${
                        r.correspondeFacturacion
                          ? "badge-activo"
                          : "badge-inactivo"
                      }`}
                    >
                      {r.correspondeFacturacion ? "Sí" : "No"}
                    </span>
                  </td>
                  <td data-label="Total">$ {formatMoney(r.total)}</td>
                  <td data-label="Acciones" className="acciones-fila">
                    <Link to={`/remitos/${r.id}`}>Ver detalle</Link>
                    <button
                      onClick={() => handleDescargar(r)}
                      disabled={descargandoId === r.id}
                    >
                      {descargandoId === r.id
                        ? "Descargando..."
                        : "Descargar PDF"}
                    </button>
                  </td>
                </tr>
              ))}
              {remitos.length === 0 && (
                <tr className="fila-vacia">
                  <td colSpan={6}>No hay remitos generados todavía.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
