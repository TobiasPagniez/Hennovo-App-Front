import { useEffect, useState } from "react";
import {
  obtenerCategorias,
  eliminarCategoria,
} from "../../services/categoriaClienteService";
import Modal from "../../components/Modal/Modal";
import CategoriaFormModal from "./CategoriaFormModal";
import "./CategoriasCliente.css";

export default function CategoriasCliente() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerCategorias();
      setCategorias(data);
    } catch {
      setError("No se pudieron cargar las categorías.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirNueva() {
    setCategoriaEditando(null);
    setModalAbierto(true);
  }

  function abrirEdicion(categoria) {
    setCategoriaEditando(categoria);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setCategoriaEditando(null);
  }

  function handleGuardado() {
    cerrarModal();
    cargar();
  }

  async function handleEliminar(categoria) {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar la categoría "${categoria.nombre}"? ` +
        `Esta acción es permanente y puede fallar si hay clientes o precios asociados.`
    );
    if (!confirmar) return;

    try {
      await eliminarCategoria(categoria.id);
      cargar();
    } catch {
      alert(
        "No se pudo eliminar la categoría. Es posible que esté siendo usada por algún cliente o lista de precios."
      );
    }
  }

  return (
    <div className="categorias-page">
      <div className="categorias-header">
        <h1>Categorías de cliente</h1>
        <button onClick={abrirNueva}>Nueva categoría</button>
      </div>

      {error && <p className="categorias-error">{error}</p>}

      {cargando ? (
        <p>Cargando categorías...</p>
      ) : (
        <table className="categorias-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.nombre}</td>
                <td className="categorias-acciones">
                  <button onClick={() => abrirEdicion(cat)}>Editar</button>
                  <button onClick={() => handleEliminar(cat)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan={2}>No hay categorías cargadas.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={categoriaEditando ? "Editar categoría" : "Nueva categoría"}
      >
        <CategoriaFormModal
          categoria={categoriaEditando}
          onClose={cerrarModal}
          onSaved={handleGuardado}
        />
      </Modal>
    </div>
  );
}
