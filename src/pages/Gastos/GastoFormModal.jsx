import { useState } from "react";
import { useForm } from "react-hook-form";
import { crearGasto, modificarGasto } from "../../services/gastoService";

function hoyISO() {
  return new Date().toISOString().split("T")[0];
}

export default function GastoFormModal({
  gasto,
  categoriasSugeridas,
  onClose,
  onSaved,
}) {
  const [errorApi, setErrorApi] = useState(null);
  const esEdicion = !!gasto;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fecha: gasto?.fecha ?? hoyISO(),
      categoria: gasto?.categoria ?? "",
      descripcion: gasto?.descripcion ?? "",
      importe: gasto?.importe ?? "",
      observaciones: gasto?.observaciones ?? "",
    },
  });

  async function onSubmit(data) {
    setErrorApi(null);

    const payload = {
      fecha: data.fecha,
      categoria: data.categoria,
      descripcion: data.descripcion,
      importe: Number(data.importe),
      observaciones: data.observaciones || null,
    };

    try {
      if (esEdicion) {
        await modificarGasto(gasto.id, payload);
      } else {
        await crearGasto(payload);
      }
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail || "Ocurrió un error al guardar el gasto."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label>Fecha</label>
      <input
        type="date"
        {...register("fecha", { required: "La fecha es obligatoria" })}
      />
      {errors.fecha && (
        <span className="form-error">{errors.fecha.message}</span>
      )}

      <label>Categoría</label>
      <input
        list="categorias-gasto"
        placeholder="Ej: Combustible, Sueldo, Alquiler..."
        {...register("categoria", {
          required: "La categoría es obligatoria",
        })}
      />
      <datalist id="categorias-gasto">
        {categoriasSugeridas.map((cat) => (
          <option key={cat} value={cat} />
        ))}
      </datalist>
      {errors.categoria && (
        <span className="form-error">{errors.categoria.message}</span>
      )}

      <label>Descripción</label>
      <input
        {...register("descripcion", {
          required: "La descripción es obligatoria",
        })}
      />
      {errors.descripcion && (
        <span className="form-error">{errors.descripcion.message}</span>
      )}

      <label>Importe</label>
      <input
        type="number"
        min="0.01"
        step="0.01"
        {...register("importe", {
          required: "El importe es obligatorio",
          min: { value: 0.01, message: "Debe ser mayor a 0" },
        })}
      />
      {errors.importe && (
        <span className="form-error">{errors.importe.message}</span>
      )}

      <label>Observaciones (opcional)</label>
      <textarea rows={2} {...register("observaciones")} />

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
