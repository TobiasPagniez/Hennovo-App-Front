import { useState } from "react";
import { useForm } from "react-hook-form";
import { configurarCroquis } from "../../services/plantillaCargaService";

export default function ConfigurarCroquisModal({
  vehiculoId,
  plantillaExistente,
  onClose,
  onSaved,
}) {
  const [errorApi, setErrorApi] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      filas: plantillaExistente?.filas ?? 3,
      columnas: plantillaExistente?.columnas ?? 6,
      incluirNivelSuperior: !!plantillaExistente?.tieneSuperior,
    },
  });

  async function onSubmit(data) {
    setErrorApi(null);

    const payload = {
      filas: Number(data.filas),
      columnas: Number(data.columnas),
      incluirNivelSuperior: data.incluirNivelSuperior,
    };

    try {
      await configurarCroquis(vehiculoId, payload);
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail ||
          "Ocurrió un error al configurar el croquis."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {plantillaExistente && (
        <p className="croquis-aviso">
          Si cambiás filas o columnas, se va a reiniciar todo el contenido
          cargado en el croquis de este vehículo.
        </p>
      )}

      <label>Filas</label>
      <input
        type="number"
        min="1"
        {...register("filas", {
          required: "Obligatorio",
          min: { value: 1, message: "Mínimo 1" },
        })}
      />
      {errors.filas && (
        <span className="form-error">{errors.filas.message}</span>
      )}

      <label>Columnas</label>
      <input
        type="number"
        min="1"
        {...register("columnas", {
          required: "Obligatorio",
          min: { value: 1, message: "Mínimo 1" },
        })}
      />
      {errors.columnas && (
        <span className="form-error">{errors.columnas.message}</span>
      )}

      <label className="croquis-checkbox-label">
        <input type="checkbox" {...register("incluirNivelSuperior")} />
        Este vehículo tiene un nivel superior (arriba de la base)
      </label>

      {errorApi && <p className="form-error-api">{errorApi}</p>}

      <div className="form-actions">
        <button type="button" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </form>
  );
}
