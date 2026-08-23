import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  crearProducto,
  modificarProducto,
} from "../../services/productoService";
import {
  TIPO_HUEVO_OPCIONES,
  TAMAÑO_OPCIONES,
  PRESENTACION_OPCIONES,
} from "../../utils/productoLabels";

export default function ProductoFormModal({ producto, onClose, onSaved }) {
  const [errorApi, setErrorApi] = useState(null);
  const esEdicion = !!producto;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      tipoHuevo: producto?.tipoHuevo ?? "",
      tamaño: producto?.tamaño ?? "",
      presentacion: producto?.presentacion ?? "",
    },
  });

  async function onSubmit(data) {
    setErrorApi(null);
    try {
      if (esEdicion) {
        await modificarProducto(producto.id, data);
      } else {
        await crearProducto(data);
      }
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail ||
          "Ocurrió un error al guardar el producto.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label>Tipo de huevo</label>
      <select
        {...register("tipoHuevo", { required: "El tipo es obligatorio" })}
      >
        <option value="">Seleccioná un tipo</option>
        {TIPO_HUEVO_OPCIONES.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      {errors.tipoHuevo && (
        <span className="form-error">{errors.tipoHuevo.message}</span>
      )}

      <label>Tamaño</label>
      <select {...register("tamaño", { required: "El tamaño es obligatorio" })}>
        <option value="">Seleccioná un tamaño</option>
        {TAMAÑO_OPCIONES.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      {errors.tamaño && (
        <span className="form-error">{errors.tamaño.message}</span>
      )}

      <label>Presentación</label>
      <select
        {...register("presentacion", {
          required: "La presentación es obligatoria",
        })}
      >
        <option value="">Seleccioná una presentación</option>
        {PRESENTACION_OPCIONES.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      {errors.presentacion && (
        <span className="form-error">{errors.presentacion.message}</span>
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
