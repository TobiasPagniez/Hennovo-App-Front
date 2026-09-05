import { useState } from "react";
import { useForm } from "react-hook-form";
import { cambiarPassword } from "../../services/usuarioService";

export default function CambiarPasswordForm() {
  const [errorApi, setErrorApi] = useState(null);
  const [exito, setExito] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmarPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  async function onSubmit(data) {
    setErrorApi(null);
    setExito(false);

    try {
      await cambiarPassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setExito(true);
      reset();
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorApi("La contraseña actual es incorrecta.");
      } else {
        setErrorApi(
          err.response?.data?.detail ||
            "Ocurrió un error al cambiar la contraseña."
        );
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="perfil-form">
      <h2>Cambiar contraseña</h2>

      <label>Contraseña actual</label>
      <input
        type="password"
        {...register("currentPassword", {
          required: "Ingresá tu contraseña actual",
        })}
      />
      {errors.currentPassword && (
        <span className="form-error">{errors.currentPassword.message}</span>
      )}

      <label>Nueva contraseña</label>
      <input
        type="password"
        {...register("newPassword", {
          required: "La nueva contraseña es obligatoria",
          minLength: {
            value: 6,
            message: "Debe tener al menos 6 caracteres",
          },
        })}
      />
      {errors.newPassword && (
        <span className="form-error">{errors.newPassword.message}</span>
      )}

      <label>Confirmar nueva contraseña</label>
      <input
        type="password"
        {...register("confirmarPassword", {
          required: "Confirmá la nueva contraseña",
          validate: (value) =>
            value === newPassword || "Las contraseñas no coinciden",
        })}
      />
      {errors.confirmarPassword && (
        <span className="form-error">{errors.confirmarPassword.message}</span>
      )}

      {errorApi && <p className="form-error-api">{errorApi}</p>}
      {exito && (
        <p className="perfil-exito">Contraseña actualizada correctamente.</p>
      )}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </div>
    </form>
  );
}
