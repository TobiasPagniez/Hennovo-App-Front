import { useEffect, useState } from "react";
import {
  obtenerUsuarios,
  desactivarUsuario,
} from "../../services/usuarioService";
import Modal from "../../components/Modal/Modal";
import UsuarioFormModal from "./UsuarioFormModal";
import UsuarioCrearModal from "./UsuarioCrearModal";
import "./Usuarios.css";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(true);

  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerUsuarios();
      setUsuarios(data);
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirEdicion(usuario) {
    setUsuarioEditando(usuario);
    setModalEditarAbierto(true);
  }

  function cerrarModalEditar() {
    setModalEditarAbierto(false);
    setUsuarioEditando(null);
  }

  function handleGuardado() {
    cerrarModalEditar();
    cargar();
  }

  function handleCreado() {
    setModalCrearAbierto(false);
    cargar();
  }

  async function handleDesactivar(usuario) {
    const confirmar = window.confirm(
      `¿Seguro que querés desactivar a "${usuario.nombre} ${usuario.apellido}"? ` +
        `No va a poder volver a iniciar sesión.`
    );
    if (!confirmar) return;

    try {
      await desactivarUsuario(usuario.id);
      cargar();
    } catch {
      alert("No se pudo desactivar el usuario.");
    }
  }

  const usuariosVisibles = mostrarInactivos
    ? usuarios
    : usuarios.filter((u) => u.activo);

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <h1>Usuarios</h1>
        <button onClick={() => setModalCrearAbierto(true)}>
          Nuevo usuario
        </button>
      </div>

      <label className="usuarios-toggle-inactivos">
        <input
          type="checkbox"
          checked={mostrarInactivos}
          onChange={(e) => setMostrarInactivos(e.target.checked)}
        />
        Mostrar inactivos
      </label>

      {error && <p className="usuarios-error">{error}</p>}

      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table className="usuarios-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosVisibles.map((u) => (
              <tr key={u.id} className={!u.activo ? "fila-inactiva" : ""}>
                <td>
                  {u.nombre} {u.apellido}
                </td>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td>
                  <span
                    className={`badge ${
                      u.activo ? "badge-activo" : "badge-inactivo"
                    }`}
                  >
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="usuarios-acciones">
                  <button onClick={() => abrirEdicion(u)}>Editar</button>
                  {u.activo && (
                    <button onClick={() => handleDesactivar(u)}>
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {usuariosVisibles.length === 0 && (
              <tr>
                <td colSpan={5}>No hay usuarios para mostrar.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={modalEditarAbierto}
        onClose={cerrarModalEditar}
        title="Editar usuario"
      >
        {usuarioEditando && (
          <UsuarioFormModal
            usuario={usuarioEditando}
            onClose={cerrarModalEditar}
            onSaved={handleGuardado}
          />
        )}
      </Modal>

      <Modal
        isOpen={modalCrearAbierto}
        onClose={() => setModalCrearAbierto(false)}
        title="Nuevo usuario"
      >
        <UsuarioCrearModal
          onClose={() => setModalCrearAbierto(false)}
          onSaved={handleCreado}
        />
      </Modal>
    </div>
  );
}
