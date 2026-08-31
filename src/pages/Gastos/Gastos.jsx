import { useEffect, useMemo, useState } from "react";
import { obtenerGastos, eliminarGasto } from "../../services/gastoService";
import Modal from "../../components/Modal/Modal";
import GastoFormModal from "./GastoFormModal";
import GastoReportes from "./GastoReportes";
import { formatMoney } from "../../utils/formatMoney";
import "./Gastos.css";

export default function Gastos() {
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
    const confirmar = window.confirm(
      `¿Eliminar el gasto "${gasto.descripcion}" de $ ${formatMoney(gasto.importe)}? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      await eliminarGasto(gasto.id);
      cargar();
    } catch {
      alert("No se pudo eliminar el gasto.");
    }
  }

  return (
    <div className="gastos-page">
      <div className="gastos-header">
        <h1>Gastos</h1>
        {vista === "listado" && (
          <button onClick={abrirNuevo}>Nuevo gasto</button>
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
          {error && <p className="gastos-error">{error}</p>}
          {cargando ? (
            <p>Cargando gastos...</p>
          ) : (
            <table className="gastos-tabla">
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
                    <td>{g.fecha}</td>
                    <td>{g.categoria}</td>
                    <td>{g.descripcion}</td>
                    <td>$ {formatMoney(g.importe)}</td>
                    <td className="gastos-acciones">
                      <button onClick={() => abrirEdicion(g)}>Editar</button>
                      <button onClick={() => handleEliminar(g)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {gastos.length === 0 && (
                  <tr>
                    <td colSpan={5}>No hay gastos registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
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
