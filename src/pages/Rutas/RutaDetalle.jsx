import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerRutaPorId,
  obtenerPedidosDeRuta,
  obtenerPedidosDisponibles,
  asignarPedidos,
  quitarPedido,
} from "../../services/rutaService";
import { useDialogo } from "../../context/DialogoContext";
import "./RutaDetalle.css";

export default function RutaDetalle() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const { confirmar, avisar } = useDialogo();
  const esAdmin = usuario?.rol === "ADMIN";

  const [ruta, setRuta] = useState(null);
  const [asignados, setAsignados] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);

  async function cargarTodo() {
    setCargando(true);
    setError(null);
    try {
      const rutaData = await obtenerRutaPorId(id);
      setRuta(rutaData);

      const [asignadosData, disponiblesData] = await Promise.all([
        obtenerPedidosDeRuta(id),
        obtenerPedidosDisponibles(rutaData.fecha),
      ]);

      setAsignados(asignadosData.sort((a, b) => a.orden - b.orden));
      setDisponibles(disponiblesData);
    } catch {
      setError("No se pudo cargar la información de la ruta.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function guardarOrden(nuevaLista) {
    setProcesando(true);
    try {
      const payload = {
        pedidos: nuevaLista.map((p, index) => ({
          pedidoId: p.pedidoId,
          orden: index + 1,
        })),
      };
      await asignarPedidos(id, payload);
      cargarTodo();
    } catch {
      await avisar("No se pudo actualizar el orden de la ruta.", { peligro: true });
    } finally {
      setProcesando(false);
    }
  }

  function moverArriba(index) {
    if (index === 0) return;
    const nuevaLista = [...asignados];
    [nuevaLista[index - 1], nuevaLista[index]] = [
      nuevaLista[index],
      nuevaLista[index - 1],
    ];
    guardarOrden(nuevaLista);
  }

  function moverAbajo(index) {
    if (index === asignados.length - 1) return;
    const nuevaLista = [...asignados];
    [nuevaLista[index], nuevaLista[index + 1]] = [
      nuevaLista[index + 1],
      nuevaLista[index],
    ];
    guardarOrden(nuevaLista);
  }

  async function agregarPedido(pedido) {
    const nuevaLista = [
      ...asignados,
      { pedidoId: pedido.pedidoId, orden: asignados.length + 1 },
    ];
    await guardarOrden(nuevaLista);
  }

  async function handleQuitar(pedido) {
    const ok = await confirmar(
      `¿Quitar el pedido de "${pedido.clienteNombre}" de esta ruta?`,
      { titulo: "Quitar pedido de la ruta", peligro: true, textoConfirmar: "Quitar" }
    );
    if (!ok) return;

    setProcesando(true);
    try {
      await quitarPedido(id, pedido.pedidoId);
      cargarTodo();
    } catch {
      await avisar("No se pudo quitar el pedido de la ruta.", { peligro: true });
    } finally {
      setProcesando(false);
    }
  }

  if (cargando) return <p className="estado-cargando">Cargando...</p>;
  if (error) return <p className="estado-error">{error}</p>;
  if (!ruta) return null;

  const puedeEditar = esAdmin && ruta.activa;

  return (
    <div className="ruta-detalle-page">
      <div className="page-header">
        <h1>
          {ruta.nombre} — {ruta.fecha}
        </h1>
        <Link to="/rutas">
          <button type="button" className="btn-secundario">Volver</button>
        </Link>
      </div>

      {!ruta.activa && (
        <p className="ruta-detalle-aviso">
          Esta ruta está inactiva. No se pueden modificar sus pedidos.
        </p>
      )}
      {ruta.observaciones && (
        <p className="ruta-detalle-observaciones">
          Observaciones: {ruta.observaciones}
        </p>
      )}

      <div className="ruta-detalle-columnas">
        <section className="ruta-detalle-seccion">
          <h2 className="ruta-detalle-titulo">Pedidos en la ruta</h2>
          {asignados.length === 0 ? (
            <p className="ruta-detalle-vacio">
              Todavía no hay pedidos asignados a esta ruta.
            </p>
          ) : (
            <div className="tabla-wrapper">
              <table className="tabla-base ruta-detalle-tabla">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Cliente</th>
                    <th>Dirección</th>
                    <th>Entregado</th>
                    {puedeEditar && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {asignados.map((p, index) => (
                    <tr key={p.pedidoId}>
                      <td>{p.orden}</td>
                      <td>{p.clienteNombre}</td>
                      <td>{p.direccion}</td>
                      <td>
                        <span
                          className={`badge ${
                            p.entregado ? "badge-activo" : "badge-inactivo"
                          }`}
                        >
                          {p.entregado ? "Sí" : "No"}
                        </span>
                      </td>
                      {puedeEditar && (
                        <td className="ruta-detalle-acciones">
                          <button
                            disabled={index === 0 || procesando}
                            onClick={() => moverArriba(index)}
                          >
                            ↑
                          </button>
                          <button
                            disabled={index === asignados.length - 1 || procesando}
                            onClick={() => moverAbajo(index)}
                          >
                            ↓
                          </button>
                          <button
                            disabled={procesando}
                            onClick={() => handleQuitar(p)}
                          >
                            Quitar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {puedeEditar && (
          <section className="ruta-detalle-seccion">
            <h2 className="ruta-detalle-titulo">
              Pedidos disponibles para el {ruta.fecha}
            </h2>
            {disponibles.length === 0 ? (
              <p className="ruta-detalle-vacio">
                No hay pedidos sin ruta asignada para esta fecha.
              </p>
            ) : (
              <div className="tabla-wrapper">
                <table className="tabla-base ruta-detalle-tabla">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Dirección</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {disponibles.map((p) => (
                      <tr key={p.pedidoId}>
                        <td>{p.clienteNombre}</td>
                        <td>{p.direccion}</td>
                        <td>
                          <button
                            disabled={procesando}
                            onClick={() => agregarPedido(p)}
                          >
                            Agregar a la ruta
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
