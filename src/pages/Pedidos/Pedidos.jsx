import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  obtenerPedidos,
  marcarEntregado,
  marcarPagado,
  asignarUsuarioPedido,
} from "../../services/pedidoService";
import { useAuth } from "../../context/AuthContext";
import { obtenerEmpleados } from "../../services/userService";
import { formatMoney } from "../../utils/formatMoney";
import { hoyISO } from "../../utils/dateUtils";
import "./Pedidos.css";

const TAMANO_PAGINA = 10;

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);

  const [fecha, setFecha] = useState(hoyISO());
  const [buscar, setBuscar] = useState("");

  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "ADMIN";

  const [empleados, setEmpleados] = useState([]);

  async function cargar() {
    setCargando(true);
    setError(null);

    try {
      const data = await obtenerPedidos({
        fecha: fecha || undefined,
        buscar,
        pagina,
        tamano: TAMANO_PAGINA,
      });

      setPedidos(data.contenido);
      setTotalPaginas(data.totalPaginas);
      setTotalElementos(data.totalElementos);
    } catch {
      setError("No se pudieron cargar los pedidos.");
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha, buscar, pagina]);

  useEffect(() => {
    if (esAdmin) {
      obtenerEmpleados()
        .then(setEmpleados)
        .catch(() => setEmpleados([]));
    }
  }, [esAdmin]);

  function handleCambiarFecha(e) {
    setFecha(e.target.value);
    setPagina(0);
  }

  function handleBuscar(e) {
    setBuscar(e.target.value);
    setPagina(0);
  }

  function handleVerTodos() {
    setFecha("");
    setPagina(0);
  }

  function handlePaginaAnterior() {
    if (pagina > 0) {
      setPagina(pagina - 1);
    }
  }

  function handlePaginaSiguiente() {
    if (pagina < totalPaginas - 1) {
      setPagina(pagina + 1);
    }
  }

  function handleIrAPagina(numeroPagina) {
    setPagina(numeroPagina);
  }

  async function handleMarcarEntregado(pedido) {
    const confirmar = window.confirm(
      "¿Marcar este pedido como entregado? Una vez entregado no podrá modificarse.",
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

  async function handleAsignar(pedido, usuarioId) {
    try {
      await asignarUsuarioPedido(pedido.id, Number(usuarioId));
      cargar();
    } catch {
      alert("No se pudo asignar el pedido.");
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

          <input type="date" value={fecha} onChange={handleCambiarFecha} />

          {fecha && (
            <button type="button" onClick={handleVerTodos}>
              Ver todos
            </button>
          )}
        </div>

        <div className="pedidos-busqueda">
          <label>Buscar cliente</label>

          <input
            type="text"
            value={buscar}
            onChange={handleBuscar}
            placeholder="Nombre del cliente..."
          />
        </div>
      </div>

      {error && <p className="estado-error">{error}</p>}

      {cargando ? (
        <p className="estado-cargando">Cargando pedidos...</p>
      ) : (
        <>
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
                  <th>Asignado a</th>
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

                    <td data-label="Asignado a">
                      {esAdmin ? (
                        <select
                          value={pedido.usuarioId ?? ""}
                          onChange={(e) =>
                            handleAsignar(pedido, e.target.value)
                          }
                        >
                          <option value="">Sin asignar</option>

                          {empleados.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.nombre} {emp.apellido}
                            </option>
                          ))}
                        </select>
                      ) : (
                        pedido.usuarioNombre || "Sin asignar"
                      )}
                    </td>
                  </tr>
                ))}

                {pedidos.length === 0 && (
                  <tr className="fila-vacia">
                    <td colSpan={7}>No hay pedidos para mostrar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalElementos > 0 && (
            <div className="pedidos-paginacion">
              <span className="paginacion-info">
                Mostrando {pedidos.length} de {totalElementos} pedidos
              </span>

              <div className="paginacion-controles">
                <button
                  type="button"
                  onClick={handlePaginaAnterior}
                  disabled={pagina === 0}
                >
                  Anterior
                </button>

                {Array.from({ length: totalPaginas }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={pagina === index ? "pagina-activa" : ""}
                    onClick={() => handleIrAPagina(index)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handlePaginaSiguiente}
                  disabled={pagina >= totalPaginas - 1}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
