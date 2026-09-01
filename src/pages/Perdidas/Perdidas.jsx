import { useEffect, useMemo, useState } from "react";
import {
  obtenerPerdidas,
  eliminarPerdida,
} from "../../services/perdidaService";
import Modal from "../../components/Modal/Modal";
import PerdidaFormModal from "./PerdidaFormModal";
import PerdidaReportes from "./PerdidaReportes";
import "./Perdidas.css";

export default function Perdidas() {
  const [vista, setVista] = useState("listado");
  const [perdidas, setPerdidas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [perdidaEditando, setPerdidaEditando] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerPerdidas();
      setPerdidas(data.sort((a, b) => (a.fecha < b.fecha ? 1 : -1)));
    } catch {
      setError("No se pudieron cargar las pérdidas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (vista === "listado") cargar();
  }, [vista]);

  const motivosSugeridos = useMemo(
    () => [...new Set(perdidas.map((p) => p.motivo))],
    [perdidas]
  );

  function abrirNueva() {
    setPerdidaEditando(null);
    setModalAbierto(true);
  }

  function abrirEdicion(perdida) {
    setPerdidaEditando(perdida);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setPerdidaEditando(null);
  }

  function handleGuardado() {
    cerrarModal();
    cargar();
  }

  async function handleEliminar(perdida) {
    const confirmar = window.confirm(
      `¿Eliminar el registro de pérdida de "${perdida.producto}"? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      await eliminarPerdida(perdida.id);
      cargar();
    } catch {
      alert("No se pudo eliminar el registro.");
    }
  }

  return (
    <div className="perdidas-page">
      <div className="perdidas-header">
        <h1>Pérdidas</h1>
        {vista === "listado" && (
          <button onClick={abrirNueva}>Nueva pérdida</button>
        )}
      </div>

      <div className="modulo-tabs">
        <button
          className={vista === "listado" ? "activo" : ""}
          onClick={() => setVista("listado")}
        >
          Listado
        </button>
        <button
          className={vista === "reportes" ? "activo" : ""}
          onClick={() => setVista("reportes")}
        >
          Reportes
        </button>
      </div>

      {vista === "listado" ? (
        <>
          {error && <p className="perdidas-error">{error}</p>}
          {cargando ? (
            <p>Cargando pérdidas...</p>
          ) : (
            <table className="perdidas-tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Motivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {perdidas.map((p) => (
                  <tr key={p.id}>
                    <td>{p.fecha}</td>
                    <td>{p.producto}</td>
                    <td>{p.cantidad}</td>
                    <td>{p.motivo}</td>
                    <td className="perdidas-acciones">
                      <button onClick={() => abrirEdicion(p)}>Editar</button>
                      <button onClick={() => handleEliminar(p)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {perdidas.length === 0 && (
                  <tr>
                    <td colSpan={5}>No hay pérdidas registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <PerdidaReportes />
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={perdidaEditando ? "Editar pérdida" : "Nueva pérdida"}
      >
        <PerdidaFormModal
          perdida={perdidaEditando}
          motivosSugeridos={motivosSugeridos}
          onClose={cerrarModal}
          onSaved={handleGuardado}
        />
      </Modal>
    </div>
  );
}
