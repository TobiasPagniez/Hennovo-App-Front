import { useEffect, useState } from "react";
import {
  copiarDiaCroquis,
  obtenerFechasConContenido,
} from "../../services/plantillaCargaService";

export default function CopiarDiaModal({
  vehiculoId,
  fechaDestino,
  onClose,
  onCopiado,
}) {
  const [fechas, setFechas] = useState([]);
  const [fechaOrigen, setFechaOrigen] = useState("");
  const [cargando, setCargando] = useState(true);
  const [copiando, setCopiando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerFechasConContenido(vehiculoId)
      .then((data) => {
        const disponibles = data.filter((f) => f !== fechaDestino);
        setFechas(disponibles);
      })
      .catch(() => setError("No se pudieron cargar las fechas anteriores."))
      .finally(() => setCargando(false));
  }, [vehiculoId, fechaDestino]);

  async function handleCopiar() {
    if (!fechaOrigen) return;
    setCopiando(true);
    setError(null);
    try {
      await copiarDiaCroquis(vehiculoId, {
        fechaOrigen,
        fechaDestino,
      });
      onCopiado();
    } catch {
      setError("No se pudo copiar el croquis.");
    } finally {
      setCopiando(false);
    }
  }

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <p className="croquis-aviso">
        Esto va a reemplazar todo el contenido cargado para el{" "}
        <strong>{fechaDestino}</strong> con lo que había en la fecha que
        elijas.
      </p>

      {fechas.length === 0 ? (
        <p>Este vehículo todavía no tiene croquis cargados en otras fechas.</p>
      ) : (
        <>
          <label>Copiar desde</label>
          <select
            value={fechaOrigen}
            onChange={(e) => setFechaOrigen(e.target.value)}
          >
            <option value="">Seleccioná una fecha</option>
            {fechas.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </>
      )}

      {error && <p className="form-error-api">{error}</p>}

      <div className="form-actions">
        <button type="button" onClick={onClose} disabled={copiando}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleCopiar}
          disabled={!fechaOrigen || copiando}
        >
          {copiando ? "Copiando..." : "Copiar"}
        </button>
      </div>
    </div>
  );
}
