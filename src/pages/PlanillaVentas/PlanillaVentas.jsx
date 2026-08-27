import { useEffect, useState } from "react";
import Modal from "../../components/Modal/Modal";
import PedidoForm from "../Pedidos/PedidoForm";
import PlanillaVentasFila from "./PlanillaVentasFila";
import {
  obtenerPlanillaVentas,
  guardarOrdenPlanilla,
} from "../../services/planillaVentasService";
import { obtenerEmpleados } from "../../services/userService";
import { marcarPagado } from "../../services/pedidoService";
import { useAuth } from "../../context/AuthContext";
import { DIAS_SEMANA, fechasDeLaSemana, hoyISO } from "../../utils/dateUtils";
import "./PlanillaVentas.css";

function calcularIndiceHoy(fechaISO) {
  const dia = new Date(fechaISO + "T00:00:00").getDay();
  return dia >= 1 && dia <= 6 ? dia - 1 : 0;
}

export default function PlanillaVentas() {
  const { usuario } = useAuth();

  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionadoId, setEmpleadoSeleccionadoId] = useState(null);

  const [fechaBase, setFechaBase] = useState(hoyISO());
  const [fechas, setFechas] = useState(fechasDeLaSemana(hoyISO()));
  const [diaActivoIndex, setDiaActivoIndex] = useState(
    calcularIndiceHoy(hoyISO())
  );

  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [procesandoOrden, setProcesandoOrden] = useState(false);

  const [modalPedidoAbierto, setModalPedidoAbierto] = useState(false);
  const [clienteParaPedido, setClienteParaPedido] = useState(null);

  const [modalTopesAbierto, setModalTopesAbierto] = useState(false);
  const [clienteParaTopes, setClienteParaTopes] = useState(null);

  // Cargar lista de empleados, y preseleccionar al usuario logueado si es EMPLEADO
  useEffect(() => {
    obtenerEmpleados()
      .then((data) => {
        setEmpleados(data);
        if (usuario?.rol === "EMPLEADO") {
          setEmpleadoSeleccionadoId(usuario.id);
        } else if (data.length > 0) {
          setEmpleadoSeleccionadoId(data[0].id);
        }
      })
      .catch(() => setError("No se pudo cargar la lista de empleados."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFechas(fechasDeLaSemana(fechaBase));
  }, [fechaBase]);

  const fechaSeleccionada = fechas[diaActivoIndex];

  async function cargar() {
    if (!empleadoSeleccionadoId || !fechaSeleccionada) return;
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerPlanillaVentas(
        empleadoSeleccionadoId,
        fechaSeleccionada
      );
      setClientes(data);
    } catch {
      setError("No se pudo cargar la planilla de ventas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empleadoSeleccionadoId, fechaSeleccionada]);

  async function handleTogglePagado(cliente) {
    try {
      if (!cliente.pagado) {
        await marcarPagado(cliente.pedidoId);
        cargar();
      }
    } catch {
      alert("No se pudo actualizar el estado de pago.");
    }
  }

  function handleCargarPedido(cliente) {
    setClienteParaPedido(cliente);
    setModalPedidoAbierto(true);
  }

  function handlePedidoGuardado() {
    setModalPedidoAbierto(false);
    setClienteParaPedido(null);
    cargar();
  }

  function handleVerTopes(cliente) {
    setClienteParaTopes(cliente);
    setModalTopesAbierto(true);
  }

  async function guardarNuevoOrden(nuevaLista) {
    setProcesandoOrden(true);
    try {
      const payload = {
        usuarioId: empleadoSeleccionadoId,
        fecha: fechaSeleccionada,
        items: nuevaLista.map((c, index) => ({
          clienteId: c.clienteId,
          orden: index + 1,
        })),
      };
      await guardarOrdenPlanilla(payload);
      setClientes(nuevaLista);
    } catch {
      alert("No se pudo guardar el nuevo orden.");
      cargar();
    } finally {
      setProcesandoOrden(false);
    }
  }

  function handleMoverArriba(cliente) {
    const index = clientes.findIndex((c) => c.clienteId === cliente.clienteId);
    if (index <= 0) return;
    const nuevaLista = [...clientes];
    [nuevaLista[index - 1], nuevaLista[index]] = [
      nuevaLista[index],
      nuevaLista[index - 1],
    ];
    guardarNuevoOrden(nuevaLista);
  }

  function handleMoverAbajo(cliente) {
    const index = clientes.findIndex((c) => c.clienteId === cliente.clienteId);
    if (index === -1 || index >= clientes.length - 1) return;
    const nuevaLista = [...clientes];
    [nuevaLista[index], nuevaLista[index + 1]] = [
      nuevaLista[index + 1],
      nuevaLista[index],
    ];
    guardarNuevoOrden(nuevaLista);
  }

  const labelDia = DIAS_SEMANA[diaActivoIndex]?.label ?? "";
  const empleadoActual = empleados.find((e) => e.id === empleadoSeleccionadoId);

  return (
    <div className="planilla-page">
      <div className="planilla-header">
        <h1>Planilla de ventas</h1>
        <div className="planilla-controles">
          <div className="planilla-selector-empleado">
            <label>Planilla de</label>
            <select
              value={empleadoSeleccionadoId ?? ""}
              onChange={(e) => setEmpleadoSeleccionadoId(Number(e.target.value))}
            >
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} {emp.apellido}
                </option>
              ))}
            </select>
          </div>
          <div className="planilla-selector-semana">
            <label>Semana de</label>
            <input
              type="date"
              value={fechaBase}
              onChange={(e) => setFechaBase(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="planilla-tabs">
        {DIAS_SEMANA.map((dia, index) => (
          <button
            key={dia.indice}
            className={`planilla-tab ${
              index === diaActivoIndex ? "activo" : ""
            }`}
            onClick={() => setDiaActivoIndex(index)}
          >
            {dia.label}
          </button>
        ))}
      </div>

      <h2 className="planilla-titulo-seccion">
        Planilla — {empleadoActual ? `${empleadoActual.nombre} — ` : ""}
        {labelDia} ({fechaSeleccionada})
      </h2>

      {error && <p className="planilla-error">{error}</p>}

      {cargando ? (
        <p>Cargando planilla...</p>
      ) : (
        <div className="planilla-tabla-wrapper">
          <table className="planilla-tabla">
            <thead>
              <tr>
                <th rowSpan={2}></th>
                <th rowSpan={2}>Cliente</th>
                <th rowSpan={2}>P</th>
                <th rowSpan={2} className="col-tope">
                  Tope
                </th>
                <th rowSpan={2} className="col-banco">
                  Banco
                </th>
                <th rowSpan={2} className="col-saldo">
                  Saldo
                </th>
                <th rowSpan={2} className="col-total">
                  Total
                </th>
                <th colSpan={2} className="col-t1">
                  T1
                </th>
                <th colSpan={2} className="col-t2">
                  T2
                </th>
                <th colSpan={2} className="col-t3">
                  T3
                </th>
                <th rowSpan={2}>Otros</th>
                <th rowSpan={2}>Acción</th>
              </tr>
              <tr>
                <th className="col-t1">color</th>
                <th className="col-t1">bco</th>
                <th className="col-t2">color</th>
                <th className="col-t2">bco</th>
                <th className="col-t3">color</th>
                <th className="col-t3">bco</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente, index) => (
                <PlanillaVentasFila
                  key={cliente.clienteId}
                  cliente={cliente}
                  puedeEditar={!procesandoOrden}
                  esPrimero={index === 0}
                  esUltimo={index === clientes.length - 1}
                  onTogglePagado={handleTogglePagado}
                  onCargarPedido={handleCargarPedido}
                  onVerTopes={handleVerTopes}
                  onMoverArriba={handleMoverArriba}
                  onMoverAbajo={handleMoverAbajo}
                />
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={14}>No hay clientes activos para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalPedidoAbierto}
        onClose={() => setModalPedidoAbierto(false)}
        title={`Cargar pedido — ${clienteParaPedido?.clienteNombre ?? ""}`}
      >
        {clienteParaPedido && (
          <PedidoForm
            modoEmbebido
            clienteInicial={{
              id: clienteParaPedido.clienteId,
              nombre: clienteParaPedido.clienteNombre,
            }}
            fechaInicial={fechaSeleccionada}
            usuarioIdInicial={empleadoSeleccionadoId}
            onSaved={handlePedidoGuardado}
          />
        )}
      </Modal>

      <Modal
        isOpen={modalTopesAbierto}
        onClose={() => setModalTopesAbierto(false)}
        title={`Tope — ${clienteParaTopes?.clienteNombre ?? ""}`}
      >
        {clienteParaTopes && (
          <ul className="planilla-topes-lista">
            {clienteParaTopes.topes.map((t) => (
              <li key={t.productoId}>
                {t.producto}: <strong>{t.cantidad}</strong>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
