import { useState } from "react";
import { useForm } from "react-hook-form";
import { crearVehiculo } from "../../services/vehiculoService";

export default function VehiculoCrearModal({ onClose, onSaved }) {
  const [errorApi, setErrorApi] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      patente: "",
      marca: "",
      modelo: "",
      anio: "",
      kilometrajeActual: 0,
    },
  });

  async function onSubmit(data) {
    setErrorApi(null);

    const payload = {
      patente: data.patente.toUpperCase(),
      marca: data.marca,
      modelo: data.modelo,
      anio: data.anio ? Number(data.anio) : null,
      kilometrajeActual: Number(data.kilometrajeActual),
    };

    try {
      await crearVehiculo(payload);
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail ||
          "Ocurrió un error al registrar el vehículo."
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

      <label>Año (opcional)</label>
      <input type="number" {...register("anio")} />

      <label>Kilometraje inicial</label>
      <input
        type="number"
        min="0"
        {...register("kilometrajeActual", {
          required: "El kilometraje es obligatorio",
          min: { value: 0, message: "No puede ser negativo" },
        })}
      />
      {errors.kilometrajeActual && (
        <span className="form-error">{errors.kilometrajeActual.message}</span>
      )}

      {errorApi && <p className="form-error-api">{errorApi}</p>}

      <div className="form-actions">
        <button type="button" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Registrar vehículo"}
        </button>
      </div>
    </form>
  );
}
