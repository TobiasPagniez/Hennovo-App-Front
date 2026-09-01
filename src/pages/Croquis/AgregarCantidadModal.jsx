import { useState } from "react";
import { useForm } from "react-hook-form";
import { agregarDetalleCelda } from "../../services/plantillaCargaService";
import { nombreProducto } from "../../utils/productoNombre";

export default function AgregarCantidadModal({
  celdaId,
  producto,
  fecha,
  onClose,
  onSaved,
}) {
  const [errorApi, setErrorApi] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { cantidad: 1 },
  });

  async function onSubmit(data) {
    setErrorApi(null);
    try {
      await agregarDetalleCelda(celdaId, {
        fecha,
        productoId: producto.id,
        cantidad: Number(data.cantidad),
      });
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail || "No se pudo agregar el producto."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <p>
        Agregar <strong>{nombreProducto(producto)}</strong> a esta celda
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
        <button type="button" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Agregando..." : "Agregar"}
        </button>
      </div>
    </form>
  );
}
