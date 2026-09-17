import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import ClienteAutocomplete from "../../components/ClienteAutocomplete/ClienteAutocomplete";
import { obtenerProductosActivos } from "../../services/productoService";
import { obtenerHabitualesPorCliente } from "../../services/pedidoHabitualService";
import {
  obtenerPedidoPorId,
  crearPedido,
  actualizarPedido,
} from "../../services/pedidoService";
import { obtenerClientePorId } from "../../services/clienteService";
import { nombreProducto } from "../../utils/productoNombre";
import "./PedidoForm.css";

function hoyISO() {
  return new Date().toISOString().split("T")[0];
}

export default function PedidoForm({
  clienteInicial,
  fechaInicial,
  usuarioIdInicial,
  modoEmbebido = false,
  onSaved,
} = {}) {
  const { id } = useParams();
  const esEdicion = !!id;
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [errorApi, setErrorApi] = useState(null);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(
    clienteInicial ?? null,
  );
  const [habituales, setHabituales] = useState([]);
  const [pedidoOriginal, setPedidoOriginal] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fecha: fechaInicial ?? hoyISO(),
      observaciones: "",
      banco: "",
      detalles: [{ productoId: "", cantidad: 1 }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "detalles",
  });
  const detallesActuales = useWatch({ control, name: "detalles" }) ?? [];

  function cargarProductosHabituales() {
    if (!clienteSeleccionado || habituales.length === 0) return;

    replace(
      habituales.map((habitual) => ({
        productoId: String(habitual.idProducto),
        cantidad: habitual.cantidad,
      })),
    );
  }

  useEffect(() => {
    async function cargarProductos() {
      try {
        const data = await obtenerProductosActivos();
        setProductos(data);
      } catch {
        setError("No se pudieron cargar los productos.");
      }
    }
    cargarProductos();
  }, []);

  useEffect(() => {
    async function cargarPedido() {
      if (!esEdicion) {
        setCargando(false);
        return;
      }
      setCargando(true);
      try {
        const pedido = await obtenerPedidoPorId(id);
        setPedidoOriginal(pedido);

        const cliente = await obtenerClientePorId(pedido.clienteId);
        setClienteSeleccionado(cliente);

        setValue("fecha", pedido.fecha);
        setValue("observaciones", pedido.observaciones ?? "");
        setValue("banco", pedido.banco ?? "");
        setValue(
          "detalles",
          pedido.detalles.map((d) => ({
            productoId: String(d.productoId),
            cantidad: d.cantidad,
          })),
        );
      } catch {
        setError("No se pudo cargar el pedido.");
      } finally {
        setCargando(false);
      }
    }
    cargarPedido();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    async function cargarHabituales() {
      if (!clienteSeleccionado) {
        setHabituales([]);
        return;
      }
      try {
        const data = await obtenerHabitualesPorCliente(clienteSeleccionado.id);
        setHabituales(data);
      } catch {
        setHabituales([]);
      }
    }
    cargarHabituales();
  }, [clienteSeleccionado]);

  function topeDe(productoId) {
    if (!productoId) return null;
    const habitual = habituales.find(
      (h) => String(h.idProducto) === String(productoId),
    );
    return habitual ? habitual.cantidad : null;
  }

  async function onSubmit(data) {
    setErrorApi(null);

    if (!clienteSeleccionado) {
      setErrorApi("Tenés que seleccionar un cliente.");
      return;
    }

    const payload = {
      clienteId: clienteSeleccionado.id,
      fecha: data.fecha,
      observaciones: data.observaciones,
      banco: data.banco || null,
      usuarioId: usuarioIdInicial ?? undefined,
      detalles: data.detalles.map((d) => ({
        productoId: Number(d.productoId),
        cantidad: Number(d.cantidad),
      })),
    };

    try {
      if (esEdicion) {
        await actualizarPedido(id, payload);
      } else {
        await crearPedido(payload);
      }
      if (modoEmbebido && onSaved) {
        onSaved();
      } else {
        navigate("/pedidos");
      }
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail || "Ocurrió un error al guardar el pedido.",
      );
    }
  }

  if (cargando) return <p className="estado-cargando">Cargando...</p>;
  if (error) return <p className="estado-error">{error}</p>;

  if (esEdicion && pedidoOriginal?.entregado) {
    return (
      <div className="pedido-form-page">
        <p className="estado-error">
          Este pedido ya fue entregado y no puede modificarse.
        </p>
        <Link to="/pedidos">
          <button type="button">Volver</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pedido-form-page">
      {!modoEmbebido && (
        <div className="page-header">
          <h1>{esEdicion ? "Editar pedido" : "Nuevo pedido"}</h1>
          <Link to="/pedidos">
            <button type="button">Volver</button>
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label>Cliente</label>
        <ClienteAutocomplete
          clienteSeleccionado={clienteSeleccionado}
          onSeleccionar={setClienteSeleccionado}
        />
        {clienteSeleccionado && (
          <Link
            to={`/pedidos-habituales?clienteId=${clienteSeleccionado.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pedido-link-habituales"
          >
            Ver/gestionar productos habituales de este cliente
          </Link>
        )}
        
      <p></p>

        {clienteSeleccionado && (
          <button
            type="button"
            className="btn-primario"
            onClick={cargarProductosHabituales}
            disabled={habituales.length === 0}
          >
            Cargar productos habituales
          </button>
        )}

        <label>Fecha</label>
        <input
          type="date"
          {...register("fecha", { required: "La fecha es obligatoria" })}
        />
        {errors.fecha && (
          <span className="form-error">{errors.fecha.message}</span>
        )}

        <label>Banco / Medio de cobro</label>
        <input
          placeholder="Ej: Efectivo, Transferencia, Galicia..."
          {...register("banco")}
        />

        <label>Observaciones</label>
        <textarea rows={3} {...register("observaciones")} />

        <h3 className="pedido-detalles-titulo">Detalle del pedido</h3>

        <div className="pedido-detalles-wrapper">
          <table className="pedido-detalles-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad del producto</th>
                <th>Tope</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const productoIdActual = detallesActuales[index]?.productoId;
                const tope = topeDe(productoIdActual);
                return (
                  <tr key={field.id}>
                    <td>
                      <select
                        {...register(`detalles.${index}.productoId`, {
                          required: "Elegí un producto",
                        })}
                      >
                        <option value="">Seleccioná un producto</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {nombreProducto(p)}
                          </option>
                        ))}
                      </select>
                      {errors.detalles?.[index]?.productoId && (
                        <span className="form-error">
                          {errors.detalles[index].productoId.message}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        {...register(`detalles.${index}.cantidad`, {
                          required: "Obligatorio",
                          min: { value: 1, message: "Mínimo 1" },
                        })}
                      />
                      {errors.detalles?.[index]?.cantidad && (
                        <span className="form-error">
                          {errors.detalles[index].cantidad.message}
                        </span>
                      )}
                    </td>
                    <td className="pedido-tope-celda">
                      {tope !== null ? `Tope: ${tope}` : "-"}
                    </td>
                    <td>
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)}>
                          Quitar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={() => append({ productoId: "", cantidad: 1 })}
        >
          + Agregar producto
        </button>

        {errorApi && <p className="form-error-api">{errorApi}</p>}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primario"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}
