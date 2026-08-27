import { useState } from "react";
import { useForm } from "react-hook-form";
import { modificarUsuario } from "../../services/usuarioService";

export default function UsuarioFormModal({ usuario, onClose, onSaved }) {
  const [errorApi, setErrorApi] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nombre: usuario?.nombre ?? "",
      apellido: usuario?.apellido ?? "",
    },
  });

  async function onSubmit(data) {
    setErrorApi(null);
    try {
      await modificarUsuario(usuario.id, data);
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail ||
          "Ocurrió un error al modificar el usuario."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="usuarios-aviso">
        El email no puede modificarse desde acá.
      </p>

      <label>Email</label>
      <input value={usuario.email} disabled />

      <label>Nombre</label>
      <input
        maxLength={20}
        {...register("nombre", { required: "El nombre es obligatorio" })}
      />
      {errors.nombre && (
        <span className="form-error">{errors.nombre.message}</span>
      )}

      <label>Apellido</label>
      <input
        maxLength={20}
        {...register("apellido", { required: "El apellido es obligatorio" })}
      />
      {errors.apellido && (
        <span className="form-error">{errors.apellido.message}</span>
      )}

      {errorApi && <p className="form-error-api">{errorApi}</p>}

      <div className="form-actions">
        <button type="button" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
