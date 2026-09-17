import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import {
  obtenerClientes,
  buscarClientesPorNombre,
  desactivarCliente,
  reactivarCliente,
} from "../../services/clienteService";
import { obtenerCategorias } from "../../services/categoriaClienteService";
import Modal from "../../components/Modal/Modal";
import ClienteFormModal from "./ClienteFormModal";
import { useDialogo } from "../../context/DialogoContext";
import "./Clientes.css";

export default function Clientes() {
  const { confirmar, avisar } = useDialogo();
  const [clientes, setClientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [mostrarInactivos, setMostrarInactivos] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  async function cargarClientes() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerClientes();
      setClientes(data);
    } catch {
      setError("No se pudieron cargar los clientes.");
    } finally {
      setCargando(false);
    }
  }

  async function cargarCategorias() {
    try {
      const data = await obtenerCategorias();
      setCategorias(data);
    } catch (err) {
      console.error("No se pudieron cargar las categorías", err);
    }
  }

  useEffect(() => {
    cargarClientes();
    cargarCategorias();
  }, []);

  async function handleBuscar(e) {
    e.preventDefault();
    if (!busqueda.trim()) {
      cargarClientes();
      return;
    }
    setCargando(true);
    try {
      const data = await buscarClientesPorNombre(busqueda.trim());
      setClientes(data);
    } catch {
      setError("No se pudo realizar la búsqueda.");
    } finally {
      setCargando(false);
    }
  }

  async function handleDesactivar(cliente) {
    const ok = await confirmar(
      `¿Seguro que querés desactivar a "${cliente.nombre}"?`,
      { titulo: "Desactivar cliente", peligro: true, textoConfirmar: "Desactivar" }
    );
    if (!ok) return;

    try {
      await desactivarCliente(cliente.id);
      cargarClientes();
    } catch {
      avisar("No se pudo desactivar el cliente.", { peligro: true });
    }
  }

  async function handleReactivar(cliente) {
    try {
      await reactivarCliente(cliente.id);
      cargarClientes();
    } catch {
      avisar("No se pudo reactivar el cliente.", { peligro: true });
    }
  }

  function abrirNuevo() {
    setClienteEditando(null);
    setModalAbierto(true);
  }

  function abrirEdicion(cliente) {
    setClienteEditando(cliente);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setClienteEditando(null);
  }

  function handleGuardado() {
    cerrarModal();
    cargarClientes();
  }

  const clientesVisibles = mostrarInactivos
    ? clientes
    : clientes.filter((c) => c.activo);

  return (
    <div className="clientes-page">
      <div className="page-header">
        <h1>Clientes</h1>
        <button className="btn-primario" onClick={abrirNuevo}>
          Nuevo cliente
        </button>
      </div>

      <div className="page-toolbar">
        <form className="clientes-busqueda" onSubmit={handleBuscar}>
          <Search size={16} className="clientes-busqueda-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button
              type="button"
              className="clientes-busqueda-limpiar"
              onClick={() => {
                setBusqueda("");
                cargarClientes();
              }}
              title="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </form>

        <label className="toggle-checkbox">
          <input
            type="checkbox"
            checked={mostrarInactivos}
            onChange={(e) => setMostrarInactivos(e.target.checked)}
          />
          Mostrar inactivos
        </label>
      </div>

      {error && <p className="estado-error">{error}</p>}

      {cargando ? (
        <p className="estado-cargando">Cargando clientes...</p>
      ) : (
        <div className="tabla-wrapper tabla-responsive-cards">
          <table className="tabla-base">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Localidad</th>
                <th>Teléfono</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesVisibles.map((cliente) => (
                <tr
                  key={cliente.id}
                  className={!cliente.activo ? "fila-inactiva" : ""}
                >
                  <td data-label="Nombre">
                    <span className="celda-destacada">{cliente.nombre}</span>
                  </td>
                  <td data-label="Dirección">{cliente.direccion}</td>
                  <td data-label="Localidad">{cliente.localidad}</td>
                  <td data-label="Teléfono">{cliente.telefono}</td>
                  <td data-label="Categoría">{cliente.nombreCategoria}</td>
                  <td data-label="Estado">
                    <span
                      className={`badge ${
                        cliente.activo ? "badge-activo" : "badge-inactivo"
                      }`}
                    >
                      {cliente.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td data-label="Acciones" className="acciones-fila">
                    <Link to={`/pagos?clienteId=${cliente.id}`}>
                      Cuenta corriente
                    </Link>
                    <button onClick={() => abrirEdicion(cliente)}>
                      Editar
                    </button>
                    {cliente.activo ? (
                      <button onClick={() => handleDesactivar(cliente)}>
                        Desactivar
                      </button>
                    ) : (
                      <button onClick={() => handleReactivar(cliente)}>
                        Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {clientesVisibles.length === 0 && (
                <tr className="fila-vacia">
                  <td colSpan={7}>No hay clientes para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={clienteEditando ? "Editar cliente" : "Nuevo cliente"}
      >
        <ClienteFormModal
          cliente={clienteEditando}
          categorias={categorias}
          onClose={cerrarModal}
          onSaved={handleGuardado}
        />
      </Modal>
    </div>
  );
}
