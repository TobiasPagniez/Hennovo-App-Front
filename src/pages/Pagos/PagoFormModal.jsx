import { useState } from "react";
import { useForm } from "react-hook-form";
import { crearPago } from "../../services/pagoService";
import { MEDIO_PAGO_OPCIONES } from "../../utils/pagoLabels";

export default function PagoFormModal({ clienteId, onClose, onSaved }) {
  const [errorApi, setErrorApi] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      importe: "",
      medioPago: "",
      numeroComprobante: "",
      observaciones: "",
    },
  });

  async function onSubmit(data) {
    setErrorApi(null);

    const payload = {
      clienteId,
      importe: Number(data.importe),
      medioPago: data.medioPago,
      numeroComprobante: data.numeroComprobante || null,
      observaciones: data.observaciones || null,
    };

    try {
      await crearPago(payload);
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail || "Ocurrió un error al registrar el pago."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label>Importe</label>
      <input
        type="number"
        min="0.01"
        step="0.01"
        {...register("importe", {
          required: "El importe es obligatorio",
          min: { value: 0.01, message: "El importe debe ser mayor a 0" },
        })}
      />
      {errors.importe && (
        <span className="form-error">{errors.importe.message}</span>
      )}

      <label>Medio de pago</label>
      <select
        {...register("medioPago", { required: "Elegí un medio de pago" })}
      >
        <option value="">Seleccioná un medio de pago</option>
        {MEDIO_PAGO_OPCIONES.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      {errors.medioPago && (
        <span className="form-error">{errors.medioPago.message}</span>
      )}

      <label>N° de comprobante (opcional)</label>
      <input {...register("numeroComprobante")} />

      <label>Observaciones (opcional)</label>
      <textarea rows={2} {...register("observaciones")} />

      {errorApi && <p className="form-error-api">{errorApi}</p>}

      <div className="form-actions">
        <button type="button" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" className="btn-primario" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Registrar pago"}
        </button>
      </div>
    </form>
  );
}
