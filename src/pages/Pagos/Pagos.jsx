import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ClienteAutocomplete from "../../components/ClienteAutocomplete/ClienteAutocomplete";
import Modal from "../../components/Modal/Modal";
import PagoFormModal from "./PagoFormModal";
import { obtenerCuentaCorriente } from "../../services/cuentaCorrienteService";
import {
  obtenerPagosPorCliente,
  anularPago,
} from "../../services/pagoService";
import { obtenerClientePorId } from "../../services/clienteService";
import { formatMoney } from "../../utils/formatMoney";
import {
  labelMedioPago,
  labelEstadoPedido,
  claseEstadoPedido,
} from "../../utils/pagoLabels";
import "./Pagos.css";

export default function Pagos() {
  const [searchParams] = useSearchParams();
  const clienteIdInicial = searchParams.get("clienteId");

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [cargandoClienteInicial, setCargandoClienteInicial] = useState(
    !!clienteIdInicial
  );

  const [cuenta, setCuenta] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    if (!clienteIdInicial) return;
    obtenerClientePorId(clienteIdInicial)
      .then(setClienteSeleccionado)
      .catch(() => setError("No se pudo cargar el cliente indicado."))
      .finally(() => setCargandoClienteInicial(false));
  }, [clienteIdInicial]);

  async function cargarDatos() {
    if (!clienteSeleccionado) return;
    setCargando(true);
    setError(null);
    try {
      const [cuentaData, pagosData] = await Promise.all([
        obtenerCuentaCorriente(clienteSeleccionado.id),
        obtenerPagosPorCliente(clienteSeleccionado.id),
      ]);
      setCuenta(cuentaData);
      setPagos(pagosData);
    } catch {
      setError("No se pudo cargar la cuenta corriente del cliente.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteSeleccionado]);

  function handleGuardado() {
    setModalAbierto(false);
    cargarDatos();
  }

  async function handleAnular(pago) {
    const confirmar = window.confirm(
      `¿Anular el pago de $ ${formatMoney(pago.importe)}? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      await anularPago(pago.id);
      cargarDatos();
    } catch {
      alert("No se pudo anular el pago.");
    }
  }

  if (cargandoClienteInicial) return <p>Cargando cliente...</p>;

  return (
    <div className="pagos-page">
      <h1>Pagos / Cuenta corriente</h1>

      <div className="pagos-selector">
        <label>Cliente</label>
        <ClienteAutocomplete
          clienteSeleccionado={clienteSeleccionado}
          onSeleccionar={setClienteSeleccionado}
        />
      </div>

      {!clienteSeleccionado && (
        <p className="pagos-info">
          Seleccioná un cliente para ver su cuenta corriente.
        </p>
      )}

      {error && <p className="pagos-error">{error}</p>}

      {clienteSeleccionado && cargando && <p>Cargando...</p>}

      {clienteSeleccionado && !cargando && cuenta && (
        <>
          <div className="pagos-header">
            <h2>{cuenta.clienteNombre}</h2>
            <button onClick={() => setModalAbierto(true)}>
              + Registrar pago
            </button>
          </div>

          <div className="pagos-resumen">
            <div className="pagos-resumen-item">
              <span>Total pedidos</span>
              <strong>$ {formatMoney(cuenta.totalPedidos)}</strong>
            </div>
            <div className="pagos-resumen-item">
              <span>Total pagado</span>
              <strong>$ {formatMoney(cuenta.totalPagos)}</strong>
            </div>
            <div className="pagos-resumen-item saldo-deuda">
              <span>Saldo pendiente</span>
              <strong>$ {formatMoney(cuenta.saldo)}</strong>
            </div>
            <div className="pagos-resumen-item saldo-favor">
              <span>Saldo a favor</span>
              <strong>$ {formatMoney(cuenta.saldoAFavor)}</strong>
            </div>
          </div>

          <section>
            <h3>Pedidos</h3>
            {cuenta.pedidos.length === 0 ? (
              <p>Este cliente todavía no tiene pedidos.</p>
            ) : (
              <table className="pagos-tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Pagado</th>
                    <th>Pendiente</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cuenta.pedidos.map((p) => (
                    <tr key={p.pedidoId}>
                      <td>{p.fecha}</td>
                      <td>$ {formatMoney(p.total)}</td>
                      <td>$ {formatMoney(p.pagado)}</td>
                      <td>$ {formatMoney(p.pendiente)}</td>
                      <td>
                        <span className={`badge ${claseEstadoPedido(p.estado)}`}>
                          {labelEstadoPedido(p.estado)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section>
            <h3>Pagos registrados</h3>
            {pagos.length === 0 ? (
              <p>Este cliente todavía no tiene pagos registrados.</p>
            ) : (
              <table className="pagos-tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Importe</th>
                    <th>Medio</th>
                    <th>Comprobante</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((pago) => (
                    <tr
                      key={pago.id}
                      className={pago.anulado ? "fila-inactiva" : ""}
                    >
                      <td>{pago.fecha}</td>
                      <td>$ {formatMoney(pago.importe)}</td>
                      <td>{labelMedioPago(pago.medioPago)}</td>
                      <td>{pago.numeroComprobante || "-"}</td>
                      <td>
                        <span
                          className={`badge ${
                            pago.anulado ? "badge-inactivo" : "badge-activo"
                          }`}
                        >
                          {pago.anulado ? "Anulado" : "Vigente"}
                        </span>
                      </td>
                      <td>
                        {!pago.anulado && (
                          <button onClick={() => handleAnular(pago)}>
                            Anular
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section>
            <h3>Movimientos</h3>
            <table className="pagos-tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Importe</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {cuenta.movimientos.map((m, index) => (
                  <tr key={index}>
                    <td>{m.fecha}</td>
                    <td>{m.tipo === "PEDIDO" ? "Pedido" : "Pago"}</td>
                    <td>{m.descripcion}</td>
                    <td className={m.importe < 0 ? "importe-negativo" : ""}>
                      $ {formatMoney(m.importe)}
                    </td>
                    <td>$ {formatMoney(m.saldo)}</td>
                  </tr>
                ))}
                {cuenta.movimientos.length === 0 && (
                  <tr>
                    <td colSpan={5}>No hay movimientos todavía.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Registrar pago"
      >
        {clienteSeleccionado && (
          <PagoFormModal
            clienteId={clienteSeleccionado.id}
            onClose={() => setModalAbierto(false)}
            onSaved={handleGuardado}
          />
        )}
      </Modal>
    </div>
  );
}
