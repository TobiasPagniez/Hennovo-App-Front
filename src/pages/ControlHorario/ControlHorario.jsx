import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerMisRegistros,
  eliminarRegistro,
} from "../../services/controlHorarioService";
import Modal from "../../components/Modal/Modal";
import ControlHorarioFormModal from "./ControlHorarioFormModal";
import ControlHorarioReportes from "./ControlHorarioReportes";
import { useDialogo } from "../../context/DialogoContext";
import "./ControlHorario.css";

const TURNO_LABEL = { MANANA: "Mañana", TARDE: "Tarde" };

export default function ControlHorario() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "ADMIN";
  const { confirmar, avisar } = useDialogo();

  const [vista, setVista] = useState("mios");
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroEditando, setRegistroEditando] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerMisRegistros();
      setRegistros(data.sort((a, b) => (a.fecha < b.fecha ? 1 : -1)));
    } catch {
      setError("No se pudieron cargar tus registros de horario.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (vista === "mios") cargar();
  }, [vista]);

  function abrirNuevo() {
    setRegistroEditando(null);
    setModalAbierto(true);
  }

  function abrirEdicion(registro) {
    setRegistroEditando(registro);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setRegistroEditando(null);
  }

  function handleGuardado() {
    cerrarModal();
    cargar();
  }

  async function handleEliminar(registro) {
    const ok = await confirmar(
      `¿Eliminar el registro del ${registro.fecha} (${TURNO_LABEL[registro.turno]})?`,
      { titulo: "Eliminar registro", peligro: true, textoConfirmar: "Eliminar" }
    );
    if (!ok) return;

    try {
      await eliminarRegistro(registro.id);
      cargar();
    } catch {
      await avisar("No se pudo eliminar el registro.", { peligro: true });
    }
  }

  return (
    <div className="ch-page">
      <div className="page-header">
        <h1>Control horario</h1>
        {vista === "mios" && (
          <button className="btn-primario" onClick={abrirNuevo}>
            Cargar registro
          </button>
        )}
      </div>

      {esAdmin && (
        <div className="modulo-tabs">
          <button
            className={vista === "mios" ? "activo" : ""}
            onClick={() => setVista("mios")}
          >
            Mis registros
          </button>
          <button
            className={vista === "reportes" ? "activo" : ""}
            onClick={() => setVista("reportes")}
          >
            Reportes del equipo
          </button>
        </div>
      )}

      {vista === "mios" ? (
        <>
          {error && <p className="estado-error">{error}</p>}
          {cargando ? (
            <p className="estado-cargando">Cargando registros...</p>
          ) : (
            <div className="tabla-wrapper tabla-responsive-cards">
              <table className="tabla-base">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th>Ingreso</th>
                    <th>Egreso</th>
                    <th>Horas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r) => (
                    <tr key={r.id}>
                      <td data-label="Fecha">{r.fecha}</td>
                      <td data-label="Turno">
                        <span className="ch-turno-badge">
                          {TURNO_LABEL[r.turno]}
                        </span>
                      </td>
                      <td data-label="Ingreso">{r.horaIngreso}</td>
                      <td data-label="Egreso">{r.horaEgreso}</td>
                      <td data-label="Horas">
                        <span className="celda-destacada">
                          {r.horasTrabajadas}
                        </span>
                      </td>
                      <td data-label="Acciones" className="acciones-fila">
                        <button onClick={() => abrirEdicion(r)}>
                          Editar
                        </button>
                        <button onClick={() => handleEliminar(r)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {registros.length === 0 && (
                    <tr className="fila-vacia">
                      <td colSpan={6}>Todavía no cargaste registros.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <ControlHorarioReportes />
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={registroEditando ? "Editar registro" : "Cargar registro"}
      >
        <ControlHorarioFormModal
          registro={registroEditando}
          onClose={cerrarModal}
          onSaved={handleGuardado}
        />
      </Modal>
    </div>
  );
}
