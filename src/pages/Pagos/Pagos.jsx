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

  if (cargandoClienteInicial) return <p className="estado-cargando">Cargando cliente...</p>;

  return (
    <div className="pagos-page">
      <div className="page-header">
        <h1>Pagos / Cuenta corriente</h1>
      </div>

      <div className="pagos-selector">
        <label>Cliente</label>
        <ClienteAutocomplete
          clienteSeleccionado={clienteSeleccionado}
          onSeleccionar={setClienteSeleccionado}
        />
      </div>

      {!clienteSeleccionado && (
        <p className="estado-cargando">
          Seleccioná un cliente para ver su cuenta corriente.
        </p>
      )}

      {error && <p className="estado-error">{error}</p>}

      {clienteSeleccionado && cargando && <p className="estado-cargando">Cargando...</p>}

      {clienteSeleccionado && !cargando && cuenta && (
        <>
          <div className="page-toolbar">
            <h2 className="pagos-cliente-nombre">{cuenta.clienteNombre}</h2>
            <button className="btn-primario" onClick={() => setModalAbierto(true)}>
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
            <div className="pagos-resumen-item pagos-saldo-deuda">
              <span>Saldo pendiente</span>
              <strong>$ {formatMoney(cuenta.saldo)}</strong>
            </div>
            <div className="pagos-resumen-item pagos-saldo-favor">
              <span>Saldo a favor</span>
              <strong>$ {formatMoney(cuenta.saldoAFavor)}</strong>
            </div>
          </div>

          <section className="pagos-seccion">
            <h3 className="pagos-seccion-titulo">Pedidos</h3>
            {cuenta.pedidos.length === 0 ? (
              <p className="pagos-vacio">Este cliente todavía no tiene pedidos.</p>
            ) : (
              <div className="tabla-wrapper tabla-responsive-cards">
                <table className="tabla-base">
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
                        <td data-label="Fecha">{p.fecha}</td>
                        <td data-label="Total">$ {formatMoney(p.total)}</td>
                        <td data-label="Pagado">$ {formatMoney(p.pagado)}</td>
                        <td data-label="Pendiente">$ {formatMoney(p.pendiente)}</td>
                        <td data-label="Estado">
                          <span className={`badge ${claseEstadoPedido(p.estado)}`}>
                            {labelEstadoPedido(p.estado)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="pagos-seccion">
            <h3 className="pagos-seccion-titulo">Pagos registrados</h3>
            {pagos.length === 0 ? (
              <p className="pagos-vacio">
                Este cliente todavía no tiene pagos registrados.
              </p>
            ) : (
              <div className="tabla-wrapper tabla-responsive-cards">
                <table className="tabla-base">
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
                        <td data-label="Fecha">{pago.fecha}</td>
                        <td data-label="Importe">$ {formatMoney(pago.importe)}</td>
                        <td data-label="Medio">{labelMedioPago(pago.medioPago)}</td>
                        <td data-label="Comprobante">
                          {pago.numeroComprobante || "-"}
                        </td>
                        <td data-label="Estado">
                          <span
                            className={`badge ${
                              pago.anulado ? "badge-inactivo" : "badge-activo"
                            }`}
                          >
                            {pago.anulado ? "Anulado" : "Vigente"}
                          </span>
                        </td>
                        <td data-label="Acciones" className="acciones-fila">
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
              </div>
            )}
          </section>

          <section className="pagos-seccion">
            <h3 className="pagos-seccion-titulo">Movimientos</h3>
            <div className="tabla-wrapper pagos-movimientos-wrapper">
              <table className="tabla-base pagos-movimientos-tabla">
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
                      <td className={m.importe < 0 ? "pagos-importe-negativo" : ""}>
                        $ {formatMoney(m.importe)}
                      </td>
                      <td>$ {formatMoney(m.saldo)}</td>
                    </tr>
                  ))}
                  {cuenta.movimientos.length === 0 && (
                    <tr className="fila-vacia">
                      <td colSpan={5}>No hay movimientos todavía.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
