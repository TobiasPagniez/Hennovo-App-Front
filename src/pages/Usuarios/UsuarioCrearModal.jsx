import { useState } from "react";
import { useForm } from "react-hook-form";
import { crearUsuario } from "../../services/usuarioService";

export default function UsuarioCrearModal({ onClose, onSaved }) {
  const [errorApi, setErrorApi] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      confirmarPassword: "",
    },
  });

  const password = watch("password");

  async function onSubmit(data) {
    setErrorApi(null);

    const payload = {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      password: data.password,
    };

    try {
      await crearUsuario(payload);
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail ||
          "Ocurrió un error al crear el usuario."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="usuarios-aviso">
        El usuario se crea con rol EMPLEADO. No es posible crear otro
        administrador desde la aplicación.
      </p>

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

      <label>Email</label>
      <input
        type="email"
        {...register("email", {
          required: "El email es obligatorio",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Ingresá un email válido",
          },
        })}
      />
      {errors.email && (
        <span className="form-error">{errors.email.message}</span>
      )}

      <label>Contraseña</label>
      <input
        type="password"
        {...register("password", {
          required: "La contraseña es obligatoria",
          minLength: {
            value: 6,
            message: "La contraseña debe tener al menos 6 caracteres",
          },
        })}
      />
      {errors.password && (
        <span className="form-error">{errors.password.message}</span>
      )}

      <label>Confirmar contraseña</label>
      <input
        type="password"
        {...register("confirmarPassword", {
          required: "Confirmá la contraseña",
          validate: (value) =>
            value === password || "Las contraseñas no coinciden",
        })}
      />
      {errors.confirmarPassword && (
        <span className="form-error">{errors.confirmarPassword.message}</span>
      )}

      {errorApi && <p className="form-error-api">{errorApi}</p>}

      <div className="form-actions">
        <button type="button" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" className="btn-primario" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}
