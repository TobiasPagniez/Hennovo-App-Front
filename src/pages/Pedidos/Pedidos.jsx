import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  obtenerPedidos,
  marcarEntregado,
  marcarPagado,
} from "../../services/pedidoService";
import { formatMoney } from "../../utils/formatMoney";
import { hoyISO } from "../../utils/dateUtils";
import { useDialogo } from "../../context/DialogoContext";
import "./Pedidos.css";

export default function Pedidos() {
  const { confirmar, avisar } = useDialogo();
  const [pedidos, setPedidos] = useState([]);
  const [fecha, setFecha] = useState(hoyISO());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerPedidos(fecha || undefined);
      setPedidos(data);
    } catch {
      setError("No se pudieron cargar los pedidos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  async function handleMarcarEntregado(pedido) {
    const ok = await confirmar(
      "¿Marcar este pedido como entregado? Una vez entregado no podrá modificarse.",
      { titulo: "Marcar como entregado" }
    );
    if (!ok) return;
    try {
      await marcarEntregado(pedido.id);
      cargar();
    } catch {
      avisar("No se pudo marcar como entregado.", { peligro: true });
    }
  }

  async function handleMarcarPagado(pedido) {
    try {
      await marcarPagado(pedido.id);
      cargar();
    } catch {
      avisar("No se pudo marcar como pagado.", { peligro: true });
    }
  }

  return (
    <div className="pedidos-page">
      <div className="page-header">
        <h1>Pedidos</h1>
        <Link to="/pedidos/nuevo">
          <button className="btn-primario">Nuevo pedido</button>
        </Link>
      </div>

      <div className="page-toolbar">
        <div className="pedidos-filtro">
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          {fecha && (
            <button type="button" onClick={() => setFecha("")}>
              Ver todos
            </button>
          )}
        </div>
      </div>

      {error && <p className="estado-error">{error}</p>}

      {cargando ? (
        <p className="estado-cargando">Cargando pedidos...</p>
      ) : (
        <div className="tabla-wrapper tabla-responsive-cards">
          <table className="tabla-base">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Entregado</th>
                <th>Pagado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td data-label="Fecha">{pedido.fecha}</td>
                  <td data-label="Cliente">
                    <span className="celda-destacada">
                      {pedido.clienteNombre}
                    </span>
                  </td>
                  <td data-label="Total">$ {formatMoney(pedido.total)}</td>
                  <td data-label="Entregado">
                    <span
                      className={`badge ${
                        pedido.entregado ? "badge-activo" : "badge-inactivo"
                      }`}
                    >
                      {pedido.entregado ? "Sí" : "No"}
                    </span>
                  </td>
                  <td data-label="Pagado">
                    <span
                      className={`badge ${
                        pedido.pagado ? "badge-activo" : "badge-inactivo"
                      }`}
                    >
                      {pedido.pagado ? "Sí" : "No"}
                    </span>
                  </td>
                  <td data-label="Acciones" className="acciones-fila">
                    {!pedido.entregado && (
                      <Link to={`/pedidos/${pedido.id}/editar`}>Editar</Link>
                    )}
                    {!pedido.entregado && (
                      <button onClick={() => handleMarcarEntregado(pedido)}>
                        Marcar entregado
                      </button>
                    )}
                    {!pedido.pagado && (
                      <button onClick={() => handleMarcarPagado(pedido)}>
                        Marcar pagado
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {pedidos.length === 0 && (
                <tr className="fila-vacia">
                  <td colSpan={6}>No hay pedidos para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
