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
import { useDialogo } from "../../context/DialogoContext";
import "./PedidosHabituales.css";

export default function PedidosHabituales() {
  const { confirmar, avisar } = useDialogo();
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
    const ok = await confirmar(
      `¿Seguro que querés quitar "${habitual.producto}" de los habituales de este cliente?`,
      { titulo: "Quitar producto habitual", peligro: true, textoConfirmar: "Quitar" }
    );
    if (!ok) return;

    try {
      await eliminarHabitual(habitual.id);
      cargarHabituales();
    } catch {
      await avisar("No se pudo eliminar el producto habitual.", { peligro: true });
    }
  }

  if (cargandoClienteInicial) {
    return <p className="estado-cargando">Cargando cliente...</p>;
  }

  return (
    <div className="habituales-page">
      <div className="page-header">
        <h1>Pedidos habituales</h1>
      </div>
      <p className="page-subtitulo">
        Cantidad de referencia que suele pedir cada cliente por producto.
      </p>

      <div className="habituales-selector">
        <label>Cliente</label>
        <ClienteAutocomplete
          clienteSeleccionado={clienteSeleccionado}
          onSeleccionar={setClienteSeleccionado}
        />
      </div>

      {!clienteSeleccionado && (
        <p className="estado-cargando">
          Seleccioná un cliente para ver o gestionar sus productos habituales.
        </p>
      )}

      {clienteSeleccionado && (
        <>
          <div className="page-toolbar">
            <h2 className="habituales-cliente-nombre">
              {clienteSeleccionado.nombre}
            </h2>
            <button className="btn-primario" onClick={abrirNuevo}>
              + Agregar producto habitual
            </button>
          </div>

          {error && <p className="estado-error">{error}</p>}

          {cargando ? (
            <p className="estado-cargando">Cargando...</p>
          ) : (
            <div className="tabla-wrapper tabla-responsive-cards">
              <table className="tabla-base">
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
                      <td data-label="Producto">
                        <span className="celda-destacada">{h.producto}</span>
                      </td>
                      <td data-label="Cantidad">{h.cantidad}</td>
                      <td data-label="Acciones" className="acciones-fila">
                        <button onClick={() => abrirEdicion(h)}>
                          Editar
                        </button>
                        <button onClick={() => handleEliminar(h)}>
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {habituales.length === 0 && (
                    <tr className="fila-vacia">
                      <td colSpan={3}>
                        Este cliente todavía no tiene productos habituales
                        cargados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
