import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  crearHabitual,
  modificarHabitual,
} from "../../services/pedidoHabitualService";
import { nombreProducto } from "../../utils/productoNombre";

export default function HabitualFormModal({
  clienteId,
  habitual,
  productos,
  onClose,
  onSaved,
}) {
  const [errorApi, setErrorApi] = useState(null);
  const esEdicion = !!habitual;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      idProducto: habitual?.idProducto ?? "",
      cantidad: habitual?.cantidad ?? 1,
    },
  });

  async function onSubmit(data) {
    setErrorApi(null);

    const payload = {
      idCliente: clienteId,
      idProducto: Number(data.idProducto),
      cantidad: Number(data.cantidad),
    };

    try {
      if (esEdicion) {
        await modificarHabitual(habitual.id, payload);
      } else {
        await crearHabitual(payload);
      }
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail ||
          "Ocurrió un error al guardar el producto habitual."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label>Producto</label>
      <select
        {...register("idProducto", { required: "Elegí un producto" })}
      >
        <option value="">Seleccioná un producto</option>
        {productos.map((p) => (
          <option key={p.id} value={p.id}>
            {nombreProducto(p)}
          </option>
        ))}
      </select>
      {errors.idProducto && (
        <span className="form-error">{errors.idProducto.message}</span>
      )}

      <label>Cantidad (tope)</label>
      <input
        type="number"
        min="1"
        {...register("cantidad", {
          required: "La cantidad es obligatoria",
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
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
