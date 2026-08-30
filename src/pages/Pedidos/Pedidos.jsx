import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  obtenerPedidos,
  marcarEntregado,
  marcarPagado,
} from "../../services/pedidoService";
import "./Pedidos.css";

function hoyISO() {
  return new Date().toISOString().split("T")[0];
}

export default function Pedidos() {
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
    const confirmar = window.confirm(
      "¿Marcar este pedido como entregado? Una vez entregado no podrá modificarse."
    );
    if (!confirmar) return;
    try {
      await marcarEntregado(pedido.id);
      cargar();
    } catch {
      alert("No se pudo marcar como entregado.");
    }
  }

  async function handleMarcarPagado(pedido) {
    try {
      await marcarPagado(pedido.id);
      cargar();
    } catch {
      alert("No se pudo marcar como pagado.");
    }
  }

  return (
    <div className="pedidos-page">
      <div className="pedidos-header">
        <h1>Pedidos</h1>
        <Link to="/pedidos/nuevo">
          <button>Nuevo pedido</button>
        </Link>
      </div>

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

      {error && <p className="pedidos-error">{error}</p>}

      {cargando ? (
        <p>Cargando pedidos...</p>
      ) : (
        <table className="pedidos-tabla">
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
                <td>{pedido.fecha}</td>
                <td>{pedido.clienteNombre}</td>
                <td>$ {pedido.total}</td>
                <td>
                  <span
                    className={`badge ${
                      pedido.entregado ? "badge-activo" : "badge-inactivo"
                    }`}
                  >
                    {pedido.entregado ? "Sí" : "No"}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      pedido.pagado ? "badge-activo" : "badge-inactivo"
                    }`}
                  >
                    {pedido.pagado ? "Sí" : "No"}
                  </span>
                </td>
                <td className="pedidos-acciones">
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
              <tr>
                <td colSpan={6}>No hay pedidos para mostrar.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
