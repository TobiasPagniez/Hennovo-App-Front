import { useEffect, useState } from "react";
import {
  obtenerClientes,
  buscarClientesPorNombre,
  desactivarCliente,
} from "../../services/clienteService";
import { obtenerCategorias } from "../../services/categoriaClienteService";
import Modal from "../../components/Modal/Modal";
import ClienteFormModal from "./ClienteFormModal";
import "./Clientes.css";
import { Link } from "react-router-dom";

export default function Clientes() {
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
    const confirmar = window.confirm(
      `¿Seguro que querés desactivar a "${cliente.nombre}"?`,
    );
    if (!confirmar) return;

    try {
      await desactivarCliente(cliente.id);
      cargarClientes();
    } catch {
      alert("No se pudo desactivar el cliente.");
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
      <div className="clientes-header">
        <h1>Clientes</h1>
        <button onClick={abrirNuevo}>Nuevo cliente</button>
      </div>

      <form className="clientes-busqueda" onSubmit={handleBuscar}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button type="submit">Buscar</button>
        {busqueda && (
          <button
            type="button"
            onClick={() => {
              setBusqueda("");
              cargarClientes();
            }}
          >
            Limpiar
          </button>
        )}
      </form>

      <label className="clientes-toggle-inactivos">
        <input
          type="checkbox"
          checked={mostrarInactivos}
          onChange={(e) => setMostrarInactivos(e.target.checked)}
        />
        Mostrar inactivos
      </label>

      {error && <p className="clientes-error">{error}</p>}

      {cargando ? (
        <p>Cargando clientes...</p>
      ) : (
        <table className="clientes-tabla">
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
                <td>{cliente.nombre}</td>
                <td>{cliente.direccion}</td>
                <td>{cliente.localidad}</td>
                <td>{cliente.telefono}</td>
                <td>{cliente.nombreCategoria}</td>
                <td>
                  <span
                    className={`badge ${
                      cliente.activo ? "badge-activo" : "badge-inactivo"
                    }`}
                  >
                    {cliente.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="clientes-acciones">
                  <Link to={`/pagos?clienteId=${cliente.id}`}>
                    Cuenta corriente
                  </Link>
                  <button onClick={() => abrirEdicion(cliente)}>Editar</button>
                  {cliente.activo && (
                    <button onClick={() => handleDesactivar(cliente)}>
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {clientesVisibles.length === 0 && (
              <tr>
                <td colSpan={7}>No hay clientes para mostrar.</td>
              </tr>
            )}
          </tbody>
        </table>
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
