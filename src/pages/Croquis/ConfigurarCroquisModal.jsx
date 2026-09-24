import { useEffect, useState } from "react";
import { configurarCroquis } from "../../services/plantillaCargaService";

export default function ConfigurarCroquisModal({
  vehiculoId,
  filasActuales,
  columnasActuales,
  incluirSuperiorActual,
  onClose,
  onGuardado,
}) {
  const [filas, setFilas] = useState(filasActuales || 4);
  const [columnas, setColumnas] = useState(columnasActuales || 6);
  const [incluirSuperior, setIncluirSuperior] = useState(
    incluirSuperiorActual ?? true,
  );

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Fechas que el backend informa cuando achicaría la grilla
  const [fechasAfectadas, setFechasAfectadas] = useState([]);

  // Indica que estamos esperando la confirmación del usuario
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    setFilas(filasActuales || 4);
    setColumnas(columnasActuales || 6);
    setIncluirSuperior(incluirSuperiorActual ?? true);
  }, [filasActuales, columnasActuales, incluirSuperiorActual]);

  const guardar = async (confirmarPerdidaDatos = false) => {
    setGuardando(true);
    setError("");

    try {
      await configurarCroquis(vehiculoId, {
        filas: Number(filas),
        columnas: Number(columnas),
        incluirNivelSuperior: incluirSuperior,
        confirmarPerdidaDatos,
      });

      // Si llegamos acá, el backend aceptó la operación.
      setFechasAfectadas([]);
      setMostrarConfirmacion(false);

      if (onGuardado) {
        await onGuardado();
      }

      onClose();
    } catch (err) {
      const data = err?.response?.data;

      /*
       * Cuando el backend detecta que al achicar la grilla
       * se perdería contenido, devuelve 400 y las fechas
       * afectadas.
       */
      if (
        err?.response?.status === 400 &&
        Array.isArray(data?.errors) &&
        data.errors.length > 0
      ) {
        setFechasAfectadas(data.errors);
        setMostrarConfirmacion(true);
        return;
      }

      setError(
        data?.message || data?.detail || "No se pudo configurar el croquis.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const confirmarCambios = async () => {
    await guardar(true);
  };

  const cancelarConfirmacion = () => {
    setMostrarConfirmacion(false);
    setFechasAfectadas([]);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (guardando) return;

    await guardar(false);
  };

  return (
    <>
      {!mostrarConfirmacion ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="filas">Filas</label>

            <input
              id="filas"
              type="number"
              min="1"
              value={filas}
              onChange={(e) => setFilas(e.target.value)}
              disabled={guardando}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="columnas">Columnas</label>

            <input
              id="columnas"
              type="number"
              min="1"
              value={columnas}
              onChange={(e) => setColumnas(e.target.value)}
              disabled={guardando}
              required
            />
          </div>

          <div className="form-group">
            <label className="croquis-checkbox-label">
              <input
                type="checkbox"
                checked={incluirSuperior}
                onChange={(e) => setIncluirSuperior(e.target.checked)}
                disabled={guardando}
              />
              Incluir nivel superior
            </label>
          </div>

          <p className="form-help">
            Si reducís filas o columnas, solamente se eliminará el contenido
            que quede fuera de la nueva grilla. Antes de eliminarlo se te
            pedirá confirmación.
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={guardando}>
              Cancelar
            </button>

            <button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      ) : (
        <div className="confirmacion-perdida-datos">
          <h3>Se eliminará contenido cargado</h3>

          <p>
            La nueva configuración del croquis es más pequeña y algunas celdas
            con contenido quedarían fuera de la grilla.
          </p>

          <p>
            Si continuás, se eliminará el contenido correspondiente a las
            siguientes fechas:
          </p>

          <ul>
            {fechasAfectadas.map((fecha) => (
              <li key={fecha}>{fecha}</li>
            ))}
          </ul>

          <p>¿Querés continuar y eliminar ese contenido?</p>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              onClick={cancelarConfirmacion}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={confirmarCambios}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Sí, eliminar y continuar"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
