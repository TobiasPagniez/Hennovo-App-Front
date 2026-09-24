import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { obtenerPedidos } from "../../services/pedidoService";
import { obtenerProductosTodos } from "../../services/productoService";
import {
  crearRemito,
  obtenerRemitoPorPedido,
} from "../../services/remitoService";
import { nombreProducto } from "../../utils/productoNombre";
import { formatMoney } from "../../utils/formatMoney";
import { hoyISO } from "../../utils/dateUtils";
import "./Remitos.css";

export default function RemitoNuevo() {
  const navigate = useNavigate();

  const [fechaBusqueda, setFechaBusqueda] = useState(hoyISO());
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [error, setError] = useState(null);

  const [productos, setProductos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const [errorApi, setErrorApi] = useState(null);
  const [remitoExistente, setRemitoExistente] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fecha: hoyISO(),
      correspondeFacturacion: false,
      detalles: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalles",
  });

  useEffect(() => {
    obtenerProductosTodos()
      .then(setProductos)
      .catch(() => setProductos([]));
  }, []);

  async function cargarPedidos() {
    setCargandoPedidos(true);
    setError(null);
    try {
      const data = await obtenerPedidos({ fecha: fechaBusqueda, tamano: 50 });
      setPedidos(data.contenido);
    } catch {
      setError("No se pudieron cargar los pedidos de esa fecha.");
    } finally {
      setCargandoPedidos(false);
    }
  }

  useEffect(() => {
    cargarPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaBusqueda]);

  function handleElegirPedido(pedido) {
    setPedidoSeleccionado(pedido);
    setErrorApi(null);
    setRemitoExistente(null);
    reset({
      fecha: hoyISO(),
      correspondeFacturacion: false,
      detalles: pedido.detalles.map((d) => ({
        productoId: String(d.productoId),
        cantidad: d.cantidad,
      })),
    });
  }

  function handleCancelarSeleccion() {
    setPedidoSeleccionado(null);
    setErrorApi(null);
    setRemitoExistente(null);
  }

  async function onSubmit(data) {
    setErrorApi(null);
    setRemitoExistente(null);

    const payload = {
      pedidoId: pedidoSeleccionado.id,
      fecha: data.fecha,
      correspondeFacturacion: data.correspondeFacturacion,
      detalles: data.detalles.map((d) => ({
        productoId: Number(d.productoId),
        cantidad: Number(d.cantidad),
      })),
    };

    try {
      const remito = await crearRemito(payload);
      navigate(`/remitos/${remito.id}`);
    } catch (err) {
      setErrorApi(
        err.response?.data?.detail ||
          "Ocurrió un error al generar el remito. Es posible que este pedido ya tenga uno.",
      );
      // Intentamos ofrecer un link directo si el remito ya existía
      try {
        const existente = await obtenerRemitoPorPedido(pedidoSeleccionado.id);
        setRemitoExistente(existente);
      } catch {
        // No había remito existente; el error era por otro motivo.
      }
    }
  }

  return (
    <div className="remitos-page">
      <div className="page-header">
        <h1>Nuevo remito</h1>
        <Link to="/remitos">
          <button type="button" className="btn-secundario">Volver</button>
        </Link>
      </div>

      {!pedidoSeleccionado && (
        <>
          <div className="remito-filtro-fecha">
            <label>Fecha del pedido</label>
            <input
              type="date"
              value={fechaBusqueda}
              onChange={(e) => setFechaBusqueda(e.target.value)}
            />
          </div>

          {error && <p className="estado-error">{error}</p>}

          {cargandoPedidos ? (
            <p className="estado-cargando">Cargando pedidos...</p>
          ) : (
            <div className="tabla-wrapper tabla-responsive-cards">
              <table className="tabla-base">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Entregado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p) => (
                    <tr key={p.id}>
                      <td data-label="Cliente">
                        <span className="celda-destacada">
                          {p.clienteNombre}
                        </span>
                      </td>
                      <td data-label="Total">$ {formatMoney(p.total)}</td>
                      <td data-label="Entregado">
                        {p.entregado ? "Sí" : "No"}
                      </td>
                      <td data-label="" className="acciones-fila">
                        <button onClick={() => handleElegirPedido(p)}>
                          Generar remito
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pedidos.length === 0 && (
                    <tr className="fila-vacia">
                      <td colSpan={4}>No hay pedidos para esta fecha.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {pedidoSeleccionado && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="remito-form"
        >
          <p className="remito-form-cliente">
            Cliente: <strong>{pedidoSeleccionado.clienteNombre}</strong>{" "}
            <button type="button" onClick={handleCancelarSeleccion}>
              Cambiar pedido
            </button>
          </p>

          <label>Fecha del remito</label>
          <input
            type="date"
            {...register("fecha", { required: "La fecha es obligatoria" })}
          />
          {errors.fecha && (
            <span className="form-error">{errors.fecha.message}</span>
          )}

          <label className="remito-checkbox-label">
            <input type="checkbox" {...register("correspondeFacturacion")} />
            Corresponde facturación
          </label>

          <h3 className="remito-detalles-titulo">Detalle</h3>

          <div className="tabla-wrapper remito-detalles-wrapper">
            <table className="tabla-base remito-detalles-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad del producto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
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
                    </td>
                    <td>
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)}>
                          Quitar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>{" "}
            </table>
          </div>

          <button
            type="button"
            onClick={() => append({ productoId: "", cantidad: 1 })}
          >
            + Agregar producto
          </button>

          {errorApi && (
            <div className="form-error-api">
              <p>{errorApi}</p>
              {remitoExistente && (
                <Link to={`/remitos/${remitoExistente.id}`}>
                  Ver el remito existente de este pedido
                </Link>
              )}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primario"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Generando..." : "Generar remito"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
