import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  actualizarCantidadDetalle,
  eliminarDetalleCelda,
} from "../../services/plantillaCargaService";
import { nombreProducto } from "../../utils/productoNombre";

export default function EditarDetalleModal({ detalle, producto, onClose, onSaved }) {
  const [errorApi, setErrorApi] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { cantidad: detalle.cantidad },
  });

  async function onSubmit(data) {
    setErrorApi(null);
    try {
      await actualizarCantidadDetalle(detalle.id, {
        cantidad: Number(data.cantidad),
      });
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail || "No se pudo actualizar la cantidad."
      );
    }
  }

  async function handleEliminar() {
    const confirmar = window.confirm("¿Quitar este producto de la celda?");
    if (!confirmar) return;
    try {
      await eliminarDetalleCelda(detalle.id);
      onSaved();
    } catch {
      setErrorApi("No se pudo quitar el producto.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <p>
        <strong>{producto ? nombreProducto(producto) : "Producto"}</strong>
      </p>

      <label>Cantidad</label>
      <input
        type="number"
        min="1"
        autoFocus
        {...register("cantidad", {
          required: "Obligatorio",
          min: { value: 1, message: "Mínimo 1" },
        })}
      />
      {errors.cantidad && (
        <span className="form-error">{errors.cantidad.message}</span>
      )}

      {errorApi && <p className="form-error-api">{errorApi}</p>}

      <div className="form-actions">
        <button type="button" onClick={handleEliminar} disabled={isSubmitting}>
          Quitar de la celda
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar cantidad"}
        </button>
      </div>
    </form>
  );
}
