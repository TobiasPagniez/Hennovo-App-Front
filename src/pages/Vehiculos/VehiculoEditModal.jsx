import { useState } from "react";
import { useForm } from "react-hook-form";
import { actualizarVehiculo } from "../../services/vehiculoService";

export default function VehiculoEditModal({ vehiculo, onClose, onSaved }) {
  const [errorApi, setErrorApi] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      patente: vehiculo.patente ?? "",
      marca: vehiculo.marca ?? "",
      modelo: vehiculo.modelo ?? "",
      anio: vehiculo.anio ?? "",
      proximoServiceFecha: vehiculo.proximoServiceFecha ?? "",
      vencimientoSeguro: vehiculo.vencimientoSeguro ?? "",
      vencimientoItv: vehiculo.vencimientoItv ?? "",
      vencimientoSenasa: vehiculo.vencimientoSenasa ?? "",
      proximoCambioAceiteKm: vehiculo.proximoCambioAceiteKm ?? "",
      proximaRotacionAlineadoKm: vehiculo.proximaRotacionAlineadoKm ?? "",
      proximoCambioCorreaKm: vehiculo.proximoCambioCorreaKm ?? "",
      observacionesMantenimiento: vehiculo.observacionesMantenimiento ?? "",
    },
  });

  async function onSubmit(data) {
    setErrorApi(null);

    const payload = {
      patente: data.patente,
      marca: data.marca,
      modelo: data.modelo,
      anio: data.anio ? Number(data.anio) : null,
      proximoServiceFecha: data.proximoServiceFecha || null,
      vencimientoSeguro: data.vencimientoSeguro || null,
      vencimientoItv: data.vencimientoItv || null,
      vencimientoSenasa: data.vencimientoSenasa || null,
      proximoCambioAceiteKm: data.proximoCambioAceiteKm
        ? Number(data.proximoCambioAceiteKm)
        : null,
      proximaRotacionAlineadoKm: data.proximaRotacionAlineadoKm
        ? Number(data.proximaRotacionAlineadoKm)
        : null,
      proximoCambioCorreaKm: data.proximoCambioCorreaKm
        ? Number(data.proximoCambioCorreaKm)
        : null,
      observacionesMantenimiento: data.observacionesMantenimiento || null,
    };

    try {
      await actualizarVehiculo(vehiculo.id, payload);
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail ||
          "Ocurrió un error al actualizar el vehículo."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label>Patente</label>
      <input
        {...register("patente", { required: "La patente es obligatoria" })}
      />
      {errors.patente && (
        <span className="form-error">{errors.patente.message}</span>
      )}

      <label>Marca</label>
      <input {...register("marca", { required: "La marca es obligatoria" })} />
      {errors.marca && (
        <span className="form-error">{errors.marca.message}</span>
      )}

      <label>Modelo</label>
      <input
        {...register("modelo", { required: "El modelo es obligatorio" })}
      />
      {errors.modelo && (
        <span className="form-error">{errors.modelo.message}</span>
      )}

      <label>Año</label>
      <input type="number" {...register("anio")} />

      <h3 className="vehiculo-form-subtitulo">Vencimientos (por fecha)</h3>

      <label>Próximo service</label>
      <input type="date" {...register("proximoServiceFecha")} />

      <label>Vencimiento del seguro</label>
      <input type="date" {...register("vencimientoSeguro")} />

      <label>Vencimiento ITV</label>
      <input type="date" {...register("vencimientoItv")} />

      <label>Vencimiento SENASA</label>
      <input type="date" {...register("vencimientoSenasa")} />

      <h3 className="vehiculo-form-subtitulo">
        Mantenimiento (por kilometraje)
      </h3>
      <p className="vehiculo-form-ayuda">
        Kilometraje actual: {vehiculo.kilometrajeActual} km
      </p>

      <label>Próximo cambio de aceite (km)</label>
      <input
        type="number"
        min="0"
        {...register("proximoCambioAceiteKm")}
      />

      <label>Próxima rotación / alineación (km)</label>
      <input
        type="number"
        min="0"
        {...register("proximaRotacionAlineadoKm")}
      />

      <label>Próximo cambio de correa (km)</label>
      <input type="number" min="0" {...register("proximoCambioCorreaKm")} />

      <label>Observaciones de mantenimiento</label>
      <textarea rows={3} {...register("observacionesMantenimiento")} />

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
