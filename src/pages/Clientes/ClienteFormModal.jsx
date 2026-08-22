import { useState } from "react";
import { useForm } from "react-hook-form";
import { crearCliente, modificarCliente } from "../../services/clienteService";
import { TELEFONO_REGEX } from "../../utils/validators";

export default function ClienteFormModal({ cliente, categorias, onClose, onSaved }) {
  const [errorApi, setErrorApi] = useState(null);
  const esEdicion = !!cliente;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nombre: cliente?.nombre ?? "",
      direccion: cliente?.direccion ?? "",
      localidad: cliente?.localidad ?? "",
      telefono: cliente?.telefono ?? "",
      idCategoria: cliente?.idCategoria ?? "",
    },
  });

  async function onSubmit(data) {
    setErrorApi(null);

    const payload = {
      ...data,
      idCategoria: Number(data.idCategoria),
    };

    try {
      if (esEdicion) {
        await modificarCliente(cliente.id, payload);
      } else {
        await crearCliente(payload);
      }
      onSaved();
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail ||
          "Ocurrió un error al guardar el cliente."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label>Nombre</label>
      <input {...register("nombre", { required: "El nombre es obligatorio" })} />
      {errors.nombre && <span className="form-error">{errors.nombre.message}</span>}

      <label>Dirección</label>
      <input
        {...register("direccion", { required: "La dirección es obligatoria" })}
      />
      {errors.direccion && (
        <span className="form-error">{errors.direccion.message}</span>
      )}

      <label>Localidad</label>
      <input
        {...register("localidad", { required: "La localidad es obligatoria" })}
      />
      {errors.localidad && (
        <span className="form-error">{errors.localidad.message}</span>
      )}

      <label>Teléfono</label>
      <input
        placeholder="Ej: 353 513 7740"
        {...register("telefono", {
          required: "El teléfono es obligatorio",
          pattern: {
            value: TELEFONO_REGEX,
            message: "Ingresá un teléfono válido (ej: 353 513 7740)",
          },
        })}
      />
      {errors.telefono && (
        <span className="form-error">{errors.telefono.message}</span>
      )}

      <label>Categoría</label>
      <select
        {...register("idCategoria", { required: "La categoría es obligatoria" })}
      >
        <option value="">Seleccioná una categoría</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nombre}
          </option>
        ))}
      </select>
      {errors.idCategoria && (
        <span className="form-error">{errors.idCategoria.message}</span>
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
