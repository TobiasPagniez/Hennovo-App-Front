import { useEffect, useState } from "react";
import {
  obtenerCategorias,
  eliminarCategoria,
} from "../../services/categoriaClienteService";
import Modal from "../../components/Modal/Modal";
import CategoriaFormModal from "./CategoriaFormModal";
import { useDialogo } from "../../context/DialogoContext";
import "./CategoriasCliente.css";

export default function CategoriasCliente() {
  const { confirmar, avisar } = useDialogo();
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
    const ok = await confirmar(
      `¿Seguro que querés eliminar la categoría "${categoria.nombre}"? ` +
        `Esta acción es permanente y puede fallar si hay clientes o precios asociados.`,
      { titulo: "Eliminar categoría", peligro: true, textoConfirmar: "Eliminar" }
    );
    if (!ok) return;

    try {
      await eliminarCategoria(categoria.id);
      cargar();
    } catch {
      await avisar(
        "No se pudo eliminar la categoría. Es posible que esté siendo usada por algún cliente o lista de precios.",
        { peligro: true }
      );
    }
  }

  return (
    <div className="categorias-page">
      <div className="categorias-header">
        <div>
          <h1>Categorías de cliente</h1>
          <p className="categorias-subtitulo">
            Definen los distintos niveles de precio para cada cliente.
          </p>
        </div>
        <button className="btn-primario" onClick={abrirNueva}>
          Nueva categoría
        </button>
      </div>

      {error && <p className="categorias-error">{error}</p>}

      {cargando ? (
        <p className="categorias-cargando">Cargando categorías...</p>
      ) : (
        <div className="categorias-tabla-wrapper">
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
                  <td data-label="Nombre">
                    <span className="categorias-badge-nombre">
                      {cat.nombre}
                    </span>
                  </td>
                  <td data-label="Acciones" className="categorias-acciones">
                    <button onClick={() => abrirEdicion(cat)}>Editar</button>
                    <button
                      className="btn-peligro-link"
                      onClick={() => handleEliminar(cat)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                <tr className="fila-vacia">
                  <td colSpan={2}>No hay categorías cargadas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
