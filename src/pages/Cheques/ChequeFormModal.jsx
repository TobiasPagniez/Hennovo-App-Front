import { useState } from "react";
import { useForm } from "react-hook-form";
import ClienteAutocomplete from "../../components/ClienteAutocomplete/ClienteAutocomplete";
import { crearCheque, modificarCheque } from "../../services/chequeService";
import { obtenerClientePorId } from "../../services/clienteService";
import { useEffect } from "react";

function hoyISO() {
  return new Date().toISOString().split("T")[0];
}

export default function ChequeFormModal({ cheque, onClose, onSaved }) {
  const [errorApi, setErrorApi] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [cargandoCliente, setCargandoCliente] = useState(!!cheque);
  const esEdicion = !!cheque;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fechaIngreso: cheque?.fechaIngreso ?? hoyISO(),
      titular: cheque?.titular ?? "",
      codigoBanco: cheque?.codigoBanco ?? "",
      nombreBanco: cheque?.nombreBanco ?? "",
      importe: cheque?.importe ?? "",
      fechaPago: cheque?.fechaPago ?? "",
      endosado: cheque?.endosado ?? false,
      firmaTitular: cheque?.firmaTitular ?? false,
    },
  });

  useEffect(() => {
    if (cheque?.clienteId) {
      obtenerClientePorId(cheque.clienteId)
        .then(setClienteSeleccionado)
        .finally(() => setCargandoCliente(false));
    }
  }, [cheque]);

  async function onSubmit(data) {
    setErrorApi(null);

    if (!clienteSeleccionado) {
      setErrorApi("Tenés que seleccionar un cliente.");
      return;
    }

    const payload = {
      fechaIngreso: data.fechaIngreso,
      clienteId: clienteSeleccionado.id,
      titular: data.titular,
      codigoBanco: data.codigoBanco,
      nombreBanco: data.nombreBanco,
      importe: Number(data.importe),
      fechaPago: data.fechaPago,
      endosado: data.endosado,
      firmaTitular: data.firmaTitular,
    };

    try {
      if (esEdicion) {
        await modificarCheque(cheque.id, payload);
      } else {
        await crearCheque(payload);
      }
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail || "Ocurrió un error al guardar el cheque."
      );
    }
  }

  if (cargandoCliente) return <p>Cargando...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label>Cliente</label>
      <ClienteAutocomplete
        clienteSeleccionado={clienteSeleccionado}
        onSeleccionar={setClienteSeleccionado}
      />

      <label>Fecha de ingreso</label>
      <input
        type="date"
        {...register("fechaIngreso", {
          required: "La fecha de ingreso es obligatoria",
        })}
      />
      {errors.fechaIngreso && (
        <span className="form-error">{errors.fechaIngreso.message}</span>
      )}

      <label>Titular del cheque</label>
      <input
        {...register("titular", { required: "El titular es obligatorio" })}
      />
      {errors.titular && (
        <span className="form-error">{errors.titular.message}</span>
      )}

      <label>Código de banco</label>
      <input
        placeholder="Ej: 285"
        {...register("codigoBanco", {
          required: "El código de banco es obligatorio",
        })}
      />
      {errors.codigoBanco && (
        <span className="form-error">{errors.codigoBanco.message}</span>
      )}

      <label>Nombre del banco</label>
      <input
        placeholder="Ej: Supervielle"
        {...register("nombreBanco", {
          required: "El nombre del banco es obligatorio",
        })}
      />
      {errors.nombreBanco && (
        <span className="form-error">{errors.nombreBanco.message}</span>
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

      <label className="cheque-checkbox-label">
        <input type="checkbox" {...register("endosado")} />
        Endosado
      </label>

      <label className="cheque-checkbox-label">
        <input type="checkbox" {...register("firmaTitular")} />
        Firma del titular
      </label>

      {errorApi && <p className="form-error-api">{errorApi}</p>}

      <div className="form-actions">
        <button type="button" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" className="btn-primario" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
