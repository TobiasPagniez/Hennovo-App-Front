import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ClienteAutocomplete from "../../components/ClienteAutocomplete/ClienteAutocomplete";
import Modal from "../../components/Modal/Modal";
import HabitualFormModal from "./HabitualFormModal";
import {
  obtenerHabitualesPorCliente,
  eliminarHabitual,
} from "../../services/pedidoHabitualService";
import { obtenerProductosActivos } from "../../services/productoService";
import { obtenerClientePorId } from "../../services/clienteService";
import "./PedidosHabituales.css";

export default function PedidosHabituales() {
  const [searchParams] = useSearchParams();
  const clienteIdInicial = searchParams.get("clienteId");

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [cargandoClienteInicial, setCargandoClienteInicial] = useState(
    !!clienteIdInicial
  );
  const [habituales, setHabituales] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [habitualEditando, setHabitualEditando] = useState(null);

  useEffect(() => {
    obtenerProductosActivos()
      .then(setProductos)
      .catch(() => setProductos([]));
  }, []);

  // Si venimos con ?clienteId= desde el formulario de pedidos, precargamos el cliente
  useEffect(() => {
    if (!clienteIdInicial) return;

    obtenerClientePorId(clienteIdInicial)
      .then((cliente) => setClienteSeleccionado(cliente))
      .catch(() => setError("No se pudo cargar el cliente indicado."))
      .finally(() => setCargandoClienteInicial(false));
  }, [clienteIdInicial]);

  async function cargarHabituales() {
    if (!clienteSeleccionado) return;
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerHabitualesPorCliente(clienteSeleccionado.id);
      setHabituales(data);
    } catch {
      setError("No se pudieron cargar los productos habituales.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarHabituales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteSeleccionado]);

  function abrirNuevo() {
    setHabitualEditando(null);
    setModalAbierto(true);
  }

  function abrirEdicion(habitual) {
    setHabitualEditando(habitual);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setHabitualEditando(null);
  }

  function handleGuardado() {
    cerrarModal();
    cargarHabituales();
  }

  async function handleEliminar(habitual) {
    const confirmar = window.confirm(
      `¿Seguro que querés quitar "${habitual.producto}" de los habituales de este cliente?`
    );
    if (!confirmar) return;

    try {
      await eliminarHabitual(habitual.id);
      cargarHabituales();
    } catch {
      alert("No se pudo eliminar el producto habitual.");
    }
  }

  if (cargandoClienteInicial) {
    return <p>Cargando cliente...</p>;
  }

  return (
    <div className="habituales-page">
      <h1>Pedidos habituales (tope)</h1>

      <div className="habituales-selector">
        <label>Cliente</label>
        <ClienteAutocomplete
          clienteSeleccionado={clienteSeleccionado}
          onSeleccionar={setClienteSeleccionado}
        />
      </div>

      {!clienteSeleccionado && (
        <p className="habituales-info">
          Seleccioná un cliente para ver o gestionar sus productos habituales.
        </p>
      )}

      {clienteSeleccionado && (
        <>
          <div className="habituales-header">
            <h2>{clienteSeleccionado.nombre}</h2>
            <button onClick={abrirNuevo}>+ Agregar producto habitual</button>
          </div>

          {error && <p className="habituales-error">{error}</p>}

          {cargando ? (
            <p>Cargando...</p>
          ) : (
            <table className="habituales-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad (tope)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {habituales.map((h) => (
                  <tr key={h.id}>
                    <td>{h.producto}</td>
                    <td>{h.cantidad}</td>
                    <td className="habituales-acciones">
                      <button onClick={() => abrirEdicion(h)}>Editar</button>
                      <button onClick={() => handleEliminar(h)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
                {habituales.length === 0 && (
                  <tr>
                    <td colSpan={3}>
                      Este cliente todavía no tiene productos habituales
                      cargados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </>
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={
          habitualEditando ? "Editar producto habitual" : "Nuevo producto habitual"
        }
      >
        {clienteSeleccionado && (
          <HabitualFormModal
            clienteId={clienteSeleccionado.id}
            habitual={habitualEditando}
            productos={productos}
            onClose={cerrarModal}
            onSaved={handleGuardado}
          />
        )}
      </Modal>
    </div>
  );
}
