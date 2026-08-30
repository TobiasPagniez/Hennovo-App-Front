import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  actualizarKilometraje,
  obtenerHistorialKilometraje,
} from "../../services/vehiculoService";

export default function KilometrajeModal({ vehiculo, onClose, onSaved }) {
  const [errorApi, setErrorApi] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      kilometraje: vehiculo.kilometrajeActual,
      observacion: "",
    },
  });

  useEffect(() => {
    obtenerHistorialKilometraje(vehiculo.id)
      .then(setHistorial)
      .catch(() => setHistorial([]))
      .finally(() => setCargandoHistorial(false));
  }, [vehiculo.id]);

  async function onSubmit(data) {
    setErrorApi(null);

    const payload = {
      kilometraje: Number(data.kilometraje),
      observacion: data.observacion || null,
    };

    try {
      await actualizarKilometraje(vehiculo.id, payload);
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail ||
          "Ocurrió un error al actualizar el kilometraje."
      );
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label>Nuevo kilometraje (actual: {vehiculo.kilometrajeActual} km)</label>
        <input
          type="number"
          min={vehiculo.kilometrajeActual}
          {...register("kilometraje", {
            required: "El kilometraje es obligatorio",
            min: {
              value: vehiculo.kilometrajeActual,
              message: "No puede ser menor al kilometraje actual",
            },
          })}
        />
        {errors.kilometraje && (
          <span className="form-error">{errors.kilometraje.message}</span>
        )}

        <label>Observación (opcional)</label>
        <input
          placeholder="Ej: cambio de aceite, viaje largo..."
          {...register("observacion")}
        />

        {errorApi && <p className="form-error-api">{errorApi}</p>}

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cerrar
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Actualizar kilometraje"}
          </button>
        </div>
      </form>

      <h3 className="vehiculos-historial-titulo">Historial</h3>
      {cargandoHistorial ? (
        <p>Cargando historial...</p>
      ) : historial.length === 0 ? (
        <p>Todavía no hay registros de kilometraje.</p>
      ) : (
        <table className="vehiculos-historial-tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Km</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((h) => (
              <tr key={h.id}>
                <td>{new Date(h.fecha).toLocaleString("es-AR")}</td>
                <td>{h.kilometraje}</td>
                <td>{h.observacion || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
