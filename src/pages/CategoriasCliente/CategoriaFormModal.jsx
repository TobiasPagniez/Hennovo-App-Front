import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  crearCategoria,
  modificarCategoria,
} from "../../services/categoriaClienteService";

export default function CategoriaFormModal({ categoria, onClose, onSaved }) {
  const [errorApi, setErrorApi] = useState(null);
  const esEdicion = !!categoria;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? "",
    },
  });

  async function onSubmit(data) {
    setErrorApi(null);
    try {
      if (esEdicion) {
        await modificarCategoria(categoria.id, data);
      } else {
        await crearCategoria(data);
      }
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail ||
          "Ocurrió un error al guardar la categoría."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label>Nombre</label>
      <input
        placeholder="Ej: 1, 2, 3B..."
        {...register("nombre", { required: "El nombre es obligatorio" })}
      />
      {errors.nombre && <span className="form-error">{errors.nombre.message}</span>}

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
