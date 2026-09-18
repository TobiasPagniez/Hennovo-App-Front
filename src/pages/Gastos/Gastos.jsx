import { useEffect, useMemo, useState } from "react";
import { obtenerGastos, eliminarGasto } from "../../services/gastoService";
import Modal from "../../components/Modal/Modal";
import GastoFormModal from "./GastoFormModal";
import GastoReportes from "./GastoReportes";
import { formatMoney } from "../../utils/formatMoney";
import { useDialogo } from "../../context/DialogoContext";
import "./Gastos.css";

export default function Gastos() {
  const { confirmar, avisar } = useDialogo();
  const [vista, setVista] = useState("listado");
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [gastoEditando, setGastoEditando] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerGastos();
      setGastos(data.sort((a, b) => (a.fecha < b.fecha ? 1 : -1)));
    } catch {
      setError("No se pudieron cargar los gastos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (vista === "listado") cargar();
  }, [vista]);

  const categoriasSugeridas = useMemo(
    () => [...new Set(gastos.map((g) => g.categoria))],
    [gastos]
  );

  function abrirNuevo() {
    setGastoEditando(null);
    setModalAbierto(true);
  }

  function abrirEdicion(gasto) {
    setGastoEditando(gasto);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setGastoEditando(null);
  }

  function handleGuardado() {
    cerrarModal();
    cargar();
  }

  async function handleEliminar(gasto) {
    const ok = await confirmar(
      `¿Eliminar el gasto "${gasto.descripcion}" de $ ${formatMoney(gasto.importe)}? Esta acción no se puede deshacer.`,
      { titulo: "Eliminar gasto", peligro: true, textoConfirmar: "Eliminar" }
    );
    if (!ok) return;

    try {
      await eliminarGasto(gasto.id);
      cargar();
    } catch {
      await avisar("No se pudo eliminar el gasto.", { peligro: true });
    }
  }

  return (
    <div className="gastos-page">
      <div className="page-header">
        <h1>Gastos</h1>
        {vista === "listado" && (
          <button className="btn-primario" onClick={abrirNuevo}>
            Nuevo gasto
          </button>
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
          {error && <p className="estado-error">{error}</p>}
          {cargando ? (
            <p className="estado-cargando">Cargando gastos...</p>
          ) : (
            <div className="tabla-wrapper tabla-responsive-cards">
              <table className="tabla-base">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Importe</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((g) => (
                    <tr key={g.id}>
                      <td data-label="Fecha">{g.fecha}</td>
                      <td data-label="Categoría">
                        <span className="gastos-categoria-badge">
                          {g.categoria}
                        </span>
                      </td>
                      <td data-label="Descripción">{g.descripcion}</td>
                      <td data-label="Importe">
                        <span className="celda-destacada">
                          $ {formatMoney(g.importe)}
                        </span>
                      </td>
                      <td data-label="Acciones" className="acciones-fila">
                        <button onClick={() => abrirEdicion(g)}>
                          Editar
                        </button>
                        <button onClick={() => handleEliminar(g)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {gastos.length === 0 && (
                    <tr className="fila-vacia">
                      <td colSpan={5}>No hay gastos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <GastoReportes />
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={gastoEditando ? "Editar gasto" : "Nuevo gasto"}
      >
        <GastoFormModal
          gasto={gastoEditando}
          categoriasSugeridas={categoriasSugeridas}
          onClose={cerrarModal}
          onSaved={handleGuardado}
        />
      </Modal>
    </div>
  );
}
