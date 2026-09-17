import { useState } from "react";
import { useForm } from "react-hook-form";
import { crearPago } from "../../services/pagoService";
import { MEDIO_PAGO_OPCIONES } from "../../utils/pagoLabels";

export default function PagoFormModal({ clienteId, onClose, onSaved }) {
  const [errorApi, setErrorApi] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      importe: "",
      medioPago: "",
      numeroComprobante: "",
      observaciones: "",

      // Datos del cheque
      titular: "",
      codigoBanco: "",
      nombreBanco: "",
      fechaPago: "",
      endosado: false,
      firmaTitular: false,
    },
  });

  // Observamos el medio de pago seleccionado
  const medioPago = watch("medioPago");

  async function onSubmit(data) {
    setErrorApi(null);

    const payload = {
      clienteId,
      importe: Number(data.importe),
      medioPago: data.medioPago,
      numeroComprobante: data.numeroComprobante || null,
      observaciones: data.observaciones || null,

      // Datos del cheque
      titular: data.medioPago === "CHEQUE" ? data.titular : null,
      codigoBanco: data.medioPago === "CHEQUE" ? data.codigoBanco : null,
      nombreBanco: data.medioPago === "CHEQUE" ? data.nombreBanco : null,
      fechaPago: data.medioPago === "CHEQUE" ? data.fechaPago : null,
      endosado: data.medioPago === "CHEQUE" ? data.endosado : null,
      firmaTitular: data.medioPago === "CHEQUE" ? data.firmaTitular : null,
    };

    try {
      await crearPago(payload);
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail || "Ocurrió un error al registrar el pago.",
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
          min: {
            value: 0.01,
            message: "El importe debe ser mayor a 0",
          },
        })}
      />

      {errors.importe && (
        <span className="form-error">{errors.importe.message}</span>
      )}

      <label>Medio de pago</label>

      <select
        {...register("medioPago", {
          required: "Elegí un medio de pago",
        })}
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

      {/* ==========================================
          DATOS DEL CHEQUE
          Solo aparecen si se selecciona CHEQUE
          ========================================== */}

      {medioPago === "CHEQUE" && (
        <>
          <label>Titular del cheque</label>
          <input
            type="text"
            {...register("titular", {
              required: "El titular es obligatorio",
            })}
          />

          {errors.titular && (
            <span className="form-error">{errors.titular.message}</span>
          )}

          <label>Código de banco</label>
          <input
            type="text"
            {...register("codigoBanco", {
              required: "El código de banco es obligatorio",
            })}
          />

          {errors.codigoBanco && (
            <span className="form-error">{errors.codigoBanco.message}</span>
          )}

          <label>Nombre del banco</label>
          <input
            type="text"
            {...register("nombreBanco", {
              required: "El nombre del banco es obligatorio",
            })}
          />

          {errors.nombreBanco && (
            <span className="form-error">{errors.nombreBanco.message}</span>
          )}

          <label>Fecha de pago</label>
          <input
            type="date"
            {...register("fechaPago", {
              required: "La fecha de pago es obligatoria",
            })}
          />

          {errors.fechaPago && (
            <span className="form-error">{errors.fechaPago.message}</span>
          )}

          <label>
            <input type="checkbox" {...register("endosado")} /> Cheque endosado
          </label>

          <label>
            <input type="checkbox" {...register("firmaTitular")} /> Tiene firma
            del titular
          </label>
        </>
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
