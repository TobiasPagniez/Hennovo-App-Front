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
import "./Remitos.css";

export default function RemitoDetalle() {
  const { id } = useParams();
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
      alert("No se pudo descargar el PDF del remito.");
    } finally {
      setDescargando(false);
    }
  }

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="remitos-error">{error}</p>;
  if (!remito) return null;

  return (
    <div className="remitos-page">
      <div className="remitos-header">
        <h1>Remito N° {String(remito.id).padStart(6, "0")}</h1>
        <div className="remitos-header-acciones">
          <button onClick={handleDescargar} disabled={descargando}>
            {descargando ? "Descargando..." : "Descargar PDF"}
          </button>
          <Link to="/remitos">
            <button type="button">Volver</button>
          </Link>
        </div>
      </div>

      <div className="remito-detalle-info">
        <p>
          <strong>Fecha:</strong> {remito.fecha}
        </p>
        <p>
          <strong>Cliente:</strong> {remito.clienteNombre}
        </p>
        <p>
          <strong>Dirección:</strong> {remito.clienteDireccion}
        </p>
        <p>
          <strong>Localidad:</strong> {remito.clienteLocalidad}
        </p>
        <p>
          <strong>Corresponde facturación:</strong>{" "}
          {remito.correspondeFacturacion ? "Sí" : "No"}
        </p>
      </div>

      <table className="remitos-tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Precio unitario</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {remito.detalles.map((d) => (
            <tr key={d.id}>
              <td>{nombreDeProducto(d.productoId)}</td>
              <td>{d.cantidad}</td>
              <td>{d.unidad}</td>
              <td>$ {formatMoney(d.precioUnitario)}</td>
              <td>$ {formatMoney(d.importe)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="remito-total-label">
              Total
            </td>
            <td className="remito-total-valor">
              $ {formatMoney(remito.total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
