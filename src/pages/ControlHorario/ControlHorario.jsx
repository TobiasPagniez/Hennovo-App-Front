import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerMisRegistros,
  eliminarRegistro,
} from "../../services/controlHorarioService";
import Modal from "../../components/Modal/Modal";
import ControlHorarioFormModal from "./ControlHorarioFormModal";
import ControlHorarioReportes from "./ControlHorarioReportes";
import "./ControlHorario.css";

const TURNO_LABEL = { MANANA: "Mañana", TARDE: "Tarde" };

export default function ControlHorario() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "ADMIN";

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
    const confirmar = window.confirm(
      `¿Eliminar el registro del ${registro.fecha} (${TURNO_LABEL[registro.turno]})?`
    );
    if (!confirmar) return;

    try {
      await eliminarRegistro(registro.id);
      cargar();
    } catch {
      alert("No se pudo eliminar el registro.");
    }
  }

  return (
    <div className="ch-page">
      <div className="ch-header">
        <h1>Control horario</h1>
        {vista === "mios" && (
          <button onClick={abrirNuevo}>Cargar registro</button>
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
          {error && <p className="ch-error">{error}</p>}
          {cargando ? (
            <p>Cargando registros...</p>
          ) : (
            <table className="ch-tabla">
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
                    <td>{r.fecha}</td>
                    <td>{TURNO_LABEL[r.turno]}</td>
                    <td>{r.horaIngreso}</td>
                    <td>{r.horaEgreso}</td>
                    <td>{r.horasTrabajadas}</td>
                    <td className="ch-acciones">
                      <button onClick={() => abrirEdicion(r)}>Editar</button>
                      <button onClick={() => handleEliminar(r)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {registros.length === 0 && (
                  <tr>
                    <td colSpan={6}>Todavía no cargaste registros.</td>
                  </tr>
                )}
              </tbody>
            </table>
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
