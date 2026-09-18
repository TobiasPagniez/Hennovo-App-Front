import { useEffect, useMemo, useState } from "react";
import Modal from "../../components/Modal/Modal";
import ChequeFormModal from "./ChequeFormModal";
import {
  obtenerCheques,
  desactivarCheque,
  reactivarCheque,
} from "../../services/chequeService";
import { formatMoney } from "../../utils/formatMoney";
import { useDialogo } from "../../context/DialogoContext";
import "./Cheques.css";

const FILTRO_ENDOSADO_OPCIONES = [
  { value: "", label: "Todos" },
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

export default function Cheques() {
  const { confirmar, avisar } = useDialogo();
  const [cheques, setCheques] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroBanco, setFiltroBanco] = useState("");
  const [filtroEndosado, setFiltroEndosado] = useState("");
  const [filtroFirma, setFiltroFirma] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [chequeEditando, setChequeEditando] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerCheques();
      setCheques(data);
    } catch {
      setError("No se pudieron cargar los cheques.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirNuevo() {
    setChequeEditando(null);
    setModalAbierto(true);
  }

  function abrirEdicion(cheque) {
    setChequeEditando(cheque);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setChequeEditando(null);
  }

  function handleGuardado() {
    cerrarModal();
    cargar();
  }

  async function handleDesactivar(cheque) {
    const ok = await confirmar(
      `¿Seguro que querés dar de baja el cheque de "${cheque.clienteNombre}" por $ ${formatMoney(
        cheque.importe
      )}?`,
      { titulo: "Dar de baja cheque", peligro: true, textoConfirmar: "Dar de baja" }
    );
    if (!ok) return;
    try {
      await desactivarCheque(cheque.id);
      cargar();
    } catch {
      await avisar("No se pudo dar de baja el cheque.", { peligro: true });
    }
  }

  async function handleReactivar(cheque) {
    try {
      await reactivarCheque(cheque.id);
      cargar();
    } catch {
      await avisar("No se pudo reactivar el cheque.", { peligro: true });
    }
  }

  const chequesFiltrados = useMemo(() => {
    return cheques
      .filter((c) => mostrarInactivos || c.activo)
      .filter((c) =>
        filtroCliente
          ? c.clienteNombre.toLowerCase().includes(filtroCliente.toLowerCase())
          : true
      )
      .filter((c) =>
        filtroBanco
          ? c.nombreBanco.toLowerCase().includes(filtroBanco.toLowerCase())
          : true
      )
      .filter((c) =>
        filtroEndosado ? String(c.endosado) === filtroEndosado : true
      )
      .filter((c) =>
        filtroFirma ? String(c.firmaTitular) === filtroFirma : true
      )
      .sort((a, b) => (a.fechaPago < b.fechaPago ? -1 : 1));
  }, [cheques, mostrarInactivos, filtroCliente, filtroBanco, filtroEndosado, filtroFirma]);

  return (
    <div className="cheques-page">
      <div className="page-header">
        <h1>Cheques</h1>
        <button className="btn-primario" onClick={abrirNuevo}>
          Nuevo cheque
        </button>
      </div>

      <div className="cheques-filtros">
        <div>
          <label>Cliente</label>
          <input
            type="text"
            placeholder="Filtrar por cliente..."
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
          />
        </div>
        <div>
          <label>Banco</label>
          <input
            type="text"
            placeholder="Filtrar por banco..."
            value={filtroBanco}
            onChange={(e) => setFiltroBanco(e.target.value)}
          />
        </div>
        <div>
          <label>Endosado</label>
          <select
            value={filtroEndosado}
            onChange={(e) => setFiltroEndosado(e.target.value)}
          >
            {FILTRO_ENDOSADO_OPCIONES.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Firma titular</label>
          <select
            value={filtroFirma}
            onChange={(e) => setFiltroFirma(e.target.value)}
          >
            {FILTRO_ENDOSADO_OPCIONES.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>
        <label className="toggle-checkbox cheques-toggle">
          <input
            type="checkbox"
            checked={mostrarInactivos}
            onChange={(e) => setMostrarInactivos(e.target.checked)}
          />
          Mostrar dados de baja
        </label>
      </div>

      {error && <p className="estado-error">{error}</p>}

      {cargando ? (
        <p className="estado-cargando">Cargando cheques...</p>
      ) : (
        <div className="tabla-wrapper cheques-tabla-wrapper">
          <table className="tabla-base cheques-tabla">
            <thead>
              <tr>
                <th>Fecha ingreso</th>
                <th>Cliente</th>
                <th>Titular</th>
                <th>Bco</th>
                <th>Banco</th>
                <th>Importe</th>
                <th>Fecha pago</th>
                <th>Endosado</th>
                <th>Firma titular</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {chequesFiltrados.map((c) => (
                <tr key={c.id} className={!c.activo ? "fila-inactiva" : ""}>
                  <td>{c.fechaIngreso}</td>
                  <td className="celda-destacada">{c.clienteNombre}</td>
                  <td>{c.titular}</td>
                  <td>{c.codigoBanco}</td>
                  <td>{c.nombreBanco}</td>
                  <td>$ {formatMoney(c.importe)}</td>
                  <td>{c.fechaPago}</td>
                  <td>
                    <span
                      className={`badge ${
                        c.endosado ? "badge-activo" : "badge-inactivo"
                      }`}
                    >
                      {c.endosado ? "Sí" : "No"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        c.firmaTitular ? "badge-activo" : "badge-inactivo"
                      }`}
                    >
                      {c.firmaTitular ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="acciones-fila">
                    <button onClick={() => abrirEdicion(c)}>Editar</button>
                    {c.activo ? (
                      <button onClick={() => handleDesactivar(c)}>
                        Dar de baja
                      </button>
                    ) : (
                      <button onClick={() => handleReactivar(c)}>
                        Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {chequesFiltrados.length === 0 && (
                <tr className="fila-vacia">
                  <td colSpan={10}>No hay cheques para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={chequeEditando ? "Editar cheque" : "Nuevo cheque"}
      >
        <ChequeFormModal
          cheque={chequeEditando}
          onClose={cerrarModal}
          onSaved={handleGuardado}
        />
      </Modal>
    </div>
  );
}
