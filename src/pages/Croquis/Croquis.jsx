import { useEffect, useState } from "react";
import Modal from "../../components/Modal/Modal";
import ConfigurarCroquisModal from "./ConfigurarCroquisModal";
import ProductoPaleta from "./ProductoPaleta";
import CroquisGrid from "./CroquisGrid";
import AgregarCantidadModal from "./AgregarCantidadModal";
import EditarDetalleModal from "./EditarDetalleModal";
import { obtenerVehiculosActivos } from "../../services/vehiculoService";
import { obtenerProductosActivos } from "../../services/productoService";
import { obtenerPlantillasPorVehiculo } from "../../services/plantillaCargaService";
import {
  moverDetalleCelda,
} from "../../services/plantillaCargaService";
import "./Croquis.css";

export default function Croquis() {
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoId, setVehiculoId] = useState(null);
  const [productos, setProductos] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [nivelActivo, setNivelActivo] = useState("INFERIOR");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalConfigurar, setModalConfigurar] = useState(false);

  const [dropPendiente, setDropPendiente] = useState(null); // { celdaId, producto }
  const [detalleEditando, setDetalleEditando] = useState(null); // { detalle, producto }

  useEffect(() => {
    Promise.all([obtenerVehiculosActivos(), obtenerProductosActivos()])
      .then(([vehiculosData, productosData]) => {
        setVehiculos(vehiculosData);
        setProductos(productosData);
        if (vehiculosData.length > 0) {
          setVehiculoId(vehiculosData[0].id);
        } else {
          setCargando(false);
        }
      })
      .catch(() => setError("No se pudieron cargar los datos iniciales."));
  }, []);

  const productosPorId = Object.fromEntries(productos.map((p) => [p.id, p]));

  async function cargarPlantillas() {
    if (!vehiculoId) return;
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerPlantillasPorVehiculo(vehiculoId);
      setPlantillas(data);
      if (data.length > 0 && !data.some((p) => p.nivel === nivelActivo)) {
        setNivelActivo(data[0].nivel);
      }
    } catch {
      setError("No se pudo cargar el croquis de este vehículo.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPlantillas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiculoId]);

  function handleConfigurado() {
    setModalConfigurar(false);
    cargarPlantillas();
  }

  function handleDropProducto(celdaId, productoId) {
    const producto = productosPorId[productoId];
    if (!producto) return;
    setDropPendiente({ celdaId, producto });
  }

  async function handleDropDetalle(celdaId, detalleId) {
    try {
      await moverDetalleCelda(detalleId, { celdaDestinoId: celdaId });
      cargarPlantillas();
    } catch {
      alert("No se pudo mover el producto.");
    }
  }

  function handleClickChip(detalle, producto) {
    setDetalleEditando({ detalle, producto });
  }

  function handleGuardadoCantidad() {
    setDropPendiente(null);
    cargarPlantillas();
  }

  function handleGuardadoEdicion() {
    setDetalleEditando(null);
    cargarPlantillas();
  }

  const plantillaInferior = plantillas.find((p) => p.nivel === "INFERIOR");
  const plantillaSuperior = plantillas.find((p) => p.nivel === "SUPERIOR");
  const plantillaMostrada =
    nivelActivo === "SUPERIOR" ? plantillaSuperior : plantillaInferior;

  return (
    <div className="croquis-page">
      <div className="croquis-header">
        <h1>Croquis de carga</h1>
        <div className="croquis-selector-vehiculo">
          <label>Vehículo</label>
          <select
            value={vehiculoId ?? ""}
            onChange={(e) => setVehiculoId(Number(e.target.value))}
          >
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.patente} — {v.marca} {v.modelo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="croquis-error">{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : plantillas.length === 0 ? (
        <div className="croquis-sin-configurar">
          <p>Este vehículo todavía no tiene un croquis configurado.</p>
          <button onClick={() => setModalConfigurar(true)}>
            Configurar croquis
          </button>
        </div>
      ) : (
        <>
          <div className="croquis-toolbar">
            {plantillaSuperior && (
              <div className="croquis-tabs">
                <button
                  className={nivelActivo === "INFERIOR" ? "activo" : ""}
                  onClick={() => setNivelActivo("INFERIOR")}
                >
                  Base
                </button>
                <button
                  className={nivelActivo === "SUPERIOR" ? "activo" : ""}
                  onClick={() => setNivelActivo("SUPERIOR")}
                >
                  Superior
                </button>
              </div>
            )}
            <button onClick={() => setModalConfigurar(true)}>
              Reconfigurar tamaño
            </button>
          </div>

          <div className="croquis-layout">
            <ProductoPaleta productos={productos} />

            {plantillaMostrada && (
              <CroquisGrid
                plantilla={plantillaMostrada}
                productosPorId={productosPorId}
                onDropProducto={handleDropProducto}
                onDropDetalle={handleDropDetalle}
                onClickChip={handleClickChip}
              />
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={modalConfigurar}
        onClose={() => setModalConfigurar(false)}
        title="Configurar croquis"
      >
        <ConfigurarCroquisModal
          vehiculoId={vehiculoId}
          plantillaExistente={
            plantillaInferior
              ? { ...plantillaInferior, tieneSuperior: !!plantillaSuperior }
              : null
          }
          onClose={() => setModalConfigurar(false)}
          onSaved={handleConfigurado}
        />
      </Modal>

      <Modal
        isOpen={!!dropPendiente}
        onClose={() => setDropPendiente(null)}
        title="Agregar producto a la celda"
      >
        {dropPendiente && (
          <AgregarCantidadModal
            celdaId={dropPendiente.celdaId}
            producto={dropPendiente.producto}
            onClose={() => setDropPendiente(null)}
            onSaved={handleGuardadoCantidad}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!detalleEditando}
        onClose={() => setDetalleEditando(null)}
        title="Editar contenido de celda"
      >
        {detalleEditando && (
          <EditarDetalleModal
            detalle={detalleEditando.detalle}
            producto={detalleEditando.producto}
            onClose={() => setDetalleEditando(null)}
            onSaved={handleGuardadoEdicion}
          />
        )}
      </Modal>
    </div>
  );
}
