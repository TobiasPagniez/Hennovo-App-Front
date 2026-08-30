import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerRemitos, descargarRemitoPdf } from "../../services/remitoService";
import { descargarArchivo } from "../../utils/downloadFile";
import { formatMoney } from "../../utils/formatMoney";
import "./Remitos.css";

export default function Remitos() {
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
      alert("No se pudo descargar el PDF del remito.");
    } finally {
      setDescargandoId(null);
    }
  }

  return (
    <div className="remitos-page">
      <div className="remitos-header">
        <h1>Remitos</h1>
        <Link to="/remitos/nuevo">
          <button>Nuevo remito</button>
        </Link>
      </div>

      {error && <p className="remitos-error">{error}</p>}

      {cargando ? (
        <p>Cargando remitos...</p>
      ) : (
        <table className="remitos-tabla">
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
                <td>{String(r.id).padStart(6, "0")}</td>
                <td>{r.fecha}</td>
                <td>{r.clienteNombre}</td>
                <td>
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
                <td>$ {formatMoney(r.total)}</td>
                <td className="remitos-acciones">
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
              <tr>
                <td colSpan={6}>No hay remitos generados todavía.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
