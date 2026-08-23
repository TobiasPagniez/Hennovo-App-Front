import { useEffect, useState } from "react";
import {
  obtenerProductosTodos,
  desactivarProducto,
  reactivarProducto,
} from "../../services/productoService";
import {
  labelTipoHuevo,
  labelTamaño,
  labelPresentacion,
} from "../../utils/productoLabels";
import Modal from "../../components/Modal/Modal";
import ProductoFormModal from "./ProductoFormModal";
import "./Productos.css";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerProductosTodos();
      setProductos(data);
    } catch {
      setError("No se pudieron cargar los productos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirNuevo() {
    setProductoEditando(null);
    setModalAbierto(true);
  }

  function abrirEdicion(producto) {
    setProductoEditando(producto);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setProductoEditando(null);
  }

  function handleGuardado() {
    cerrarModal();
    cargar();
  }

  async function handleDesactivar(producto) {
    const confirmar = window.confirm(
      "¿Seguro que querés desactivar este producto?",
    );
    if (!confirmar) return;

    try {
      await desactivarProducto(producto.id);
      cargar();
    } catch {
      alert("No se pudo desactivar el producto.");
    }
  }

  async function handleReactivar(producto) {
    try {
      await reactivarProducto(producto.id);
      cargar();
    } catch {
      alert("No se pudo reactivar el producto.");
    }
  }

  const productosVisibles = mostrarInactivos
    ? productos
    : productos.filter((p) => p.activo);

  return (
    <div className="productos-page">
      <div className="productos-header">
        <h1>Productos</h1>
        <button onClick={abrirNuevo}>Nuevo producto</button>
      </div>

      <label className="productos-toggle-inactivos">
        <input
          type="checkbox"
          checked={mostrarInactivos}
          onChange={(e) => setMostrarInactivos(e.target.checked)}
        />
        Mostrar inactivos
      </label>

      {error && <p className="productos-error">{error}</p>}

      {cargando ? (
        <p>Cargando productos...</p>
      ) : (
        <table className="productos-tabla">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Tamaño</th>
              <th>Presentación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosVisibles.map((producto) => (
              <tr
                key={producto.id}
                className={!producto.activo ? "fila-inactiva" : ""}
              >
                <td>{labelTipoHuevo(producto.tipoHuevo)}</td>
                <td>{labelTamaño(producto.tamaño)}</td>
                <td>{labelPresentacion(producto.presentacion)}</td>
                <td>
                  <span
                    className={`badge ${
                      producto.activo ? "badge-activo" : "badge-inactivo"
                    }`}
                  >
                    {producto.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="productos-acciones">
                  <button onClick={() => abrirEdicion(producto)}>Editar</button>
                  {producto.activo ? (
                    <button onClick={() => handleDesactivar(producto)}>
                      Desactivar
                    </button>
                  ) : (
                    <button onClick={() => handleReactivar(producto)}>
                      Reactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {productosVisibles.length === 0 && (
              <tr>
                <td colSpan={5}>No hay productos para mostrar.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={productoEditando ? "Editar producto" : "Nuevo producto"}
      >
        <ProductoFormModal
          producto={productoEditando}
          onClose={cerrarModal}
          onSaved={handleGuardado}
        />
      </Modal>
    </div>
  );
}
