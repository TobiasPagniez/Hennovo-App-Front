import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  obtenerRemitoPorId,
  descargarRemitoPdf,
} from "../../services/remitoService";
import { obtenerProductosTodos } from "../../services/productoService";
import { descargarArchivo } from "../../utils/downloadFile";
import { formatMoney } from "../../utils/formatMoney";
import { nombreProducto } from "../../utils/productoNombre";
import { useDialogo } from "../../context/DialogoContext";
import "./Remitos.css";

export default function RemitoDetalle() {
  const { id } = useParams();
  const { avisar } = useDialogo();
  const [remito, setRemito] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    setCargando(true);
    setError(null);
    Promise.all([obtenerRemitoPorId(id), obtenerProductosTodos()])
      .then(([remitoData, productosData]) => {
        setRemito(remitoData);
        setProductos(productosData);
      })
      .catch(() => setError("No se pudo cargar el remito."))
      .finally(() => setCargando(false));
  }, [id]);

  function nombreDeProducto(productoId) {
    const producto = productos.find((p) => p.id === productoId);
    return producto ? nombreProducto(producto) : `Producto #${productoId}`;
  }

  async function handleDescargar() {
    setDescargando(true);
    try {
      const blob = await descargarRemitoPdf(id);
      descargarArchivo(blob, `remito-${id}.pdf`);
    } catch {
      await avisar("No se pudo descargar el PDF del remito.", { peligro: true });
    } finally {
      setDescargando(false);
    }
  }

  if (cargando) return <p className="estado-cargando">Cargando...</p>;
  if (error) return <p className="estado-error">{error}</p>;
  if (!remito) return null;

  return (
    <div className="remitos-page">
      <div className="page-header">
        <h1>Remito N° {String(remito.id).padStart(6, "0")}</h1>
        <div className="remitos-header-acciones">
          <button
            className="btn-primario"
            onClick={handleDescargar}
            disabled={descargando}
          >
            {descargando ? "Descargando..." : "Descargar PDF"}
          </button>
          <Link to="/remitos">
            <button type="button" className="btn-secundario">Volver</button>
          </Link>
        </div>
      </div>

      <div className="remito-detalle-info">
        <span>
          <strong>Fecha:</strong> {remito.fecha}
        </span>
        <span>
          <strong>Cliente:</strong> {remito.clienteNombre}
        </span>
        <span>
          <strong>Dirección:</strong> {remito.clienteDireccion}
        </span>
        <span>
          <strong>Localidad:</strong> {remito.clienteLocalidad}
        </span>
        <span>
          <strong>Facturación:</strong>{" "}
          {remito.correspondeFacturacion ? "Sí" : "No"}
        </span>
      </div>

      <div className="tabla-wrapper">
        <table className="tabla-base remito-detalle-tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio unitario</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {remito.detalles.map((d) => (
              <tr key={d.id}>
                <td>{nombreDeProducto(d.productoId)}</td>
                <td>{d.cantidad}</td>
                <td>$ {formatMoney(d.precioUnitario)}</td>
                <td>$ {formatMoney(d.importe)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="remito-total-label">
                Total
              </td>
              <td className="remito-total-valor">
                $ {formatMoney(remito.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
