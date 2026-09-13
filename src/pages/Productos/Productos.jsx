import { useEffect, useState } from "react";
import {
  obtenerProductosTodos,
  desactivarProducto,
  reactivarProducto,
} from "../../services/productoService";
import { nombreProducto } from "../../utils/productoNombre";
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
      <div className="page-header">
        <h1>Productos</h1>
        <button className="btn-primario" onClick={abrirNuevo}>
          Nuevo producto
        </button>
      </div>

      <label className="toggle-checkbox">
        <input
          type="checkbox"
          checked={mostrarInactivos}
          onChange={(e) => setMostrarInactivos(e.target.checked)}
        />
        Mostrar inactivos
      </label>

      {error && <p className="estado-error">{error}</p>}

      {cargando ? (
        <p className="estado-cargando">Cargando productos...</p>
      ) : (
        <div className="tabla-wrapper tabla-responsive-cards">
          <table className="tabla-base">
            <thead>
              <tr>
                <th>Producto</th>
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
                  <td data-label="Producto">
                    <span className="celda-destacada">
                      {nombreProducto(producto)}
                    </span>
                  </td>
                  <td data-label="Estado">
                    <span
                      className={`badge ${
                        producto.activo ? "badge-activo" : "badge-inactivo"
                      }`}
                    >
                      {producto.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td data-label="Acciones" className="acciones-fila">
                    <button onClick={() => abrirEdicion(producto)}>
                      Editar
                    </button>
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
                <tr className="fila-vacia">
                  <td colSpan={3}>No hay productos para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
