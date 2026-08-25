import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  obtenerRutaPorId,
  crearRuta,
  actualizarRuta,
} from "../../services/rutaService";
import { obtenerVehiculosActivos } from "../../services/vehiculoService";
import { obtenerUsuarios } from "../../services/userService";
import "./RutaForm.css";

export default function RutaForm() {
  const { id } = useParams();
  const esEdicion = !!id;
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [errorApi, setErrorApi] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fecha: "",
      nombre: "",
      observaciones: "",
      usuarioId: "",
      vehiculoId: "",
    },
  });

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true);
      setError(null);
      try {
        const [usuariosData, vehiculosData] = await Promise.all([
          obtenerUsuarios(),
          obtenerVehiculosActivos(),
        ]);

        setEmpleados(
          usuariosData.filter((u) => u.rol === "EMPLEADO" && u.activo)
        );
        setVehiculos(vehiculosData);

        if (esEdicion) {
          const ruta = await obtenerRutaPorId(id);
          setValue("fecha", ruta.fecha);
          setValue("nombre", ruta.nombre);
          setValue("observaciones", ruta.observaciones ?? "");
          setValue("usuarioId", ruta.usuarioId);
          setValue("vehiculoId", ruta.vehiculoId);
        }
      } catch {
        setError("No se pudieron cargar los datos necesarios.");
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSubmit(data) {
    setErrorApi(null);

    const payload = {
      fecha: data.fecha,
      nombre: data.nombre,
      observaciones: data.observaciones,
      usuarioId: Number(data.usuarioId),
      vehiculoId: Number(data.vehiculoId),
    };

    try {
      if (esEdicion) {
        await actualizarRuta(id, payload);
      } else {
        await crearRuta(payload);
      }
      navigate("/rutas");
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail || "Ocurrió un error al guardar la ruta."
      );
    }
  }

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="form-error-api">{error}</p>;

  return (
    <div className="ruta-form-page">
      <div className="rutas-header">
        <h1>{esEdicion ? "Editar ruta" : "Nueva ruta"}</h1>
        <Link to="/rutas">
          <button type="button">Volver</button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label>Fecha</label>
        <input
          type="date"
          {...register("fecha", { required: "La fecha es obligatoria" })}
        />
        {errors.fecha && (
          <span className="form-error">{errors.fecha.message}</span>
        )}

        <label>Nombre</label>
        <input
          {...register("nombre", { required: "El nombre es obligatorio" })}
        />
        {errors.nombre && (
          <span className="form-error">{errors.nombre.message}</span>
        )}

        <label>Observaciones</label>
        <textarea rows={3} {...register("observaciones")} />

        <label>Empleado</label>
        <select
          {...register("usuarioId", { required: "Elegí un empleado" })}
        >
          <option value="">Seleccioná un empleado</option>
          {empleados.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.nombre} {emp.apellido}
            </option>
          ))}
        </select>
        {errors.usuarioId && (
          <span className="form-error">{errors.usuarioId.message}</span>
        )}
        {empleados.length === 0 && (
          <span className="form-error">
            No hay empleados activos disponibles. Verificá en Usuarios.
          </span>
        )}

        <label>Vehículo</label>
        <select
          {...register("vehiculoId", { required: "Elegí un vehículo" })}
        >
          <option value="">Seleccioná un vehículo</option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.patente} — {v.marca} {v.modelo}
            </option>
          ))}
        </select>
        {errors.vehiculoId && (
          <span className="form-error">{errors.vehiculoId.message}</span>
        )}
        {vehiculos.length === 0 && (
          <span className="form-error">
            No hay vehículos activos disponibles.
          </span>
        )}

        {errorApi && <p className="form-error-api">{errorApi}</p>}

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar ruta"}
          </button>
        </div>
      </form>
    </div>
  );
}
