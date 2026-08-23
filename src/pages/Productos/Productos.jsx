import { useEffect, useState } from "react";
import {
  obtenerProductosActivos,
  desactivarProducto,
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

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerProductosActivos();
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
      `¿Seguro que querés desactivar este producto? ` +
        `Una vez desactivado no va a poder reactivarse desde la aplicación.`
    );
    if (!confirmar) return;

    try {
      await desactivarProducto(producto.id);
      cargar();
    } catch {
      alert("No se pudo desactivar el producto.");
    }
  }

  return (
    <div className="productos-page">
      <div className="productos-header">
        <h1>Productos</h1>
        <button onClick={abrirNuevo}>Nuevo producto</button>
      </div>

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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{labelTipoHuevo(producto.tipoHuevo)}</td>
                <td>{labelTamaño(producto.tamaño)}</td>
                <td>{labelPresentacion(producto.presentacion)}</td>
                <td className="productos-acciones">
                  <button onClick={() => abrirEdicion(producto)}>
                    Editar
                  </button>
                  <button onClick={() => handleDesactivar(producto)}>
                    Desactivar
                  </button>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={4}>No hay productos activos para mostrar.</td>
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
