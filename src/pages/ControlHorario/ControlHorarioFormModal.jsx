import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  crearRegistro,
  actualizarRegistro,
} from "../../services/controlHorarioService";

function hoyISO() {
  return new Date().toISOString().split("T")[0];
}

const TURNO_OPCIONES = [
  { value: "MANANA", label: "Mañana" },
  { value: "TARDE", label: "Tarde" },
];

export default function ControlHorarioFormModal({ registro, onClose, onSaved }) {
  const [errorApi, setErrorApi] = useState(null);
  const esEdicion = !!registro;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fecha: registro?.fecha ?? hoyISO(),
      turno: registro?.turno ?? "",
      horaIngreso: registro?.horaIngreso ?? "",
      horaEgreso: registro?.horaEgreso ?? "",
    },
  });

  async function onSubmit(data) {
    setErrorApi(null);

    try {
      if (esEdicion) {
        await actualizarRegistro(registro.id, data);
      } else {
        await crearRegistro(data);
      }
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail ||
          "Ocurrió un error al guardar el registro."
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

      <label>Turno</label>
      <select {...register("turno", { required: "Elegí un turno" })}>
        <option value="">Seleccioná un turno</option>
        {TURNO_OPCIONES.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      {errors.turno && (
        <span className="form-error">{errors.turno.message}</span>
      )}

      <label>Hora de ingreso</label>
      <input
        type="time"
        {...register("horaIngreso", {
          required: "La hora de ingreso es obligatoria",
        })}
      />
      {errors.horaIngreso && (
        <span className="form-error">{errors.horaIngreso.message}</span>
      )}

      <label>Hora de egreso</label>
      <input
        type="time"
        {...register("horaEgreso", {
          required: "La hora de egreso es obligatoria",
        })}
      />
      {errors.horaEgreso && (
        <span className="form-error">{errors.horaEgreso.message}</span>
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
