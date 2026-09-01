import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { crearPerdida, modificarPerdida } from "../../services/perdidaService";
import { obtenerProductosActivos } from "../../services/productoService";
import { nombreProducto } from "../../utils/productoNombre";

function hoyISO() {
  return new Date().toISOString().split("T")[0];
}

export default function PerdidaFormModal({
  perdida,
  motivosSugeridos,
  onClose,
  onSaved,
}) {
  const [errorApi, setErrorApi] = useState(null);
  const [productos, setProductos] = useState([]);
  const esEdicion = !!perdida;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fecha: perdida?.fecha ?? hoyISO(),
      productoId: perdida?.productoId ?? "",
      cantidad: perdida?.cantidad ?? 1,
      motivo: perdida?.motivo ?? "",
      observaciones: perdida?.observaciones ?? "",
    },
  });

  useEffect(() => {
    obtenerProductosActivos()
      .then(setProductos)
      .catch(() => setProductos([]));
  }, []);

  async function onSubmit(data) {
    setErrorApi(null);

    const payload = {
      fecha: data.fecha,
      productoId: Number(data.productoId),
      cantidad: Number(data.cantidad),
      motivo: data.motivo,
      observaciones: data.observaciones || null,
    };

    try {
      if (esEdicion) {
        await modificarPerdida(perdida.id, payload);
      } else {
        await crearPerdida(payload);
      }
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail ||
          "Ocurrió un error al guardar la pérdida."
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

      <label>Producto</label>
      <select
        {...register("productoId", { required: "Elegí un producto" })}
      >
        <option value="">Seleccioná un producto</option>
        {productos.map((p) => (
          <option key={p.id} value={p.id}>
            {nombreProducto(p)}
          </option>
        ))}
      </select>
      {errors.productoId && (
        <span className="form-error">{errors.productoId.message}</span>
      )}

      <label>Cantidad</label>
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

      <label>Motivo</label>
      <input
        list="motivos-perdida"
        placeholder="Ej: Huevos rotos, vencimiento..."
        {...register("motivo", { required: "El motivo es obligatorio" })}
      />
      <datalist id="motivos-perdida">
        {motivosSugeridos.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>
      {errors.motivo && (
        <span className="form-error">{errors.motivo.message}</span>
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
