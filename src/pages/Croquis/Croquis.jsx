import { useEffect, useState } from "react";
import Modal from "../../components/Modal/Modal";
import ConfigurarCroquisModal from "./ConfigurarCroquisModal";
import ProductoPaleta from "./ProductoPaleta";
import CroquisGrid from "./CroquisGrid";
import AgregarCantidadModal from "./AgregarCantidadModal";
import EditarDetalleModal from "./EditarDetalleModal";
import CopiarDiaModal from "./CopiarDiaModal";
import { obtenerVehiculosActivos } from "../../services/vehiculoService";
import { obtenerProductosActivos } from "../../services/productoService";
import {
  obtenerPlantillasPorVehiculo,
  moverDetalleCelda,
} from "../../services/plantillaCargaService";
import { DIAS_SEMANA, fechasDeLaSemana, hoyISO } from "../../utils/dateUtils";
import "./Croquis.css";

function calcularIndiceHoy(fechaISO) {
  const dia = new Date(fechaISO + "T00:00:00").getDay();
  return dia >= 1 && dia <= 6 ? dia - 1 : 0;
}

export default function Croquis() {
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoId, setVehiculoId] = useState(null);
  const [productos, setProductos] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [nivelActivo, setNivelActivo] = useState("INFERIOR");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [fechaBase, setFechaBase] = useState(hoyISO());
  const [fechas, setFechas] = useState(fechasDeLaSemana(hoyISO()));
  const [diaActivoIndex, setDiaActivoIndex] = useState(
    calcularIndiceHoy(hoyISO())
  );

  const [modalConfigurar, setModalConfigurar] = useState(false);
  const [modalCopiar, setModalCopiar] = useState(false);

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [chipParaMover, setChipParaMover] = useState(null);

  const [celdaParaAgregar, setCeldaParaAgregar] = useState(null);
  const [detalleEditando, setDetalleEditando] = useState(null);

  const fechaSeleccionada = fechas[diaActivoIndex];

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

  useEffect(() => {
    setFechas(fechasDeLaSemana(fechaBase));
  }, [fechaBase]);

  const productosPorId = Object.fromEntries(productos.map((p) => [p.id, p]));

  async function cargarPlantillas() {
    if (!vehiculoId || !fechaSeleccionada) return;
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerPlantillasPorVehiculo(
        vehiculoId,
        fechaSeleccionada
      );
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
  }, [vehiculoId, fechaSeleccionada]);

  function handleConfigurado() {
    setModalConfigurar(false);
    cargarPlantillas();
  }

  function handleClickCelda(celdaId) {
    if (productoSeleccionado) {
      setCeldaParaAgregar(celdaId);
      return;
    }

    if (chipParaMover) {
      moverDetalleCelda(chipParaMover.id, { celdaDestinoId: celdaId })
        .then(() => {
          setChipParaMover(null);
          cargarPlantillas();
        })
        .catch(() => alert("No se pudo mover el producto."));
    }
  }

  function handleClickChip(detalle, producto) {
    if (productoSeleccionado || chipParaMover) return; // en modo colocar, no abrimos edición
    setDetalleEditando({ detalle, producto });
  }

  function handleGuardadoCantidad() {
    setCeldaParaAgregar(null);
    setProductoSeleccionado(null);
    cargarPlantillas();
  }

  function handleGuardadoEdicion() {
    setDetalleEditando(null);
    cargarPlantillas();
  }

  function handleIniciarMover(detalle) {
    setDetalleEditando(null);
    setChipParaMover(detalle);
  }

  function handleCopiado() {
    setModalCopiar(false);
    cargarPlantillas();
  }

  const plantillaInferior = plantillas.find((p) => p.nivel === "INFERIOR");
  const plantillaSuperior = plantillas.find((p) => p.nivel === "SUPERIOR");
  const plantillaMostrada =
    nivelActivo === "SUPERIOR" ? plantillaSuperior : plantillaInferior;

  const labelDia = DIAS_SEMANA[diaActivoIndex]?.label ?? "";
  const modoColocar = !!productoSeleccionado || !!chipParaMover;

  return (
    <div className="croquis-page">
      <div className="croquis-header">
        <h1>Croquis de carga</h1>
        <div className="croquis-selectores">
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
          <div className="croquis-selector-vehiculo">
            <label>Semana de</label>
            <input
              type="date"
              value={fechaBase}
              onChange={(e) => setFechaBase(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="planilla-tabs">
        {DIAS_SEMANA.map((dia, index) => (
          <button
            key={dia.indice}
            className={`planilla-tab ${
              index === diaActivoIndex ? "activo" : ""
            }`}
            onClick={() => setDiaActivoIndex(index)}
          >
            {dia.label}
          </button>
        ))}
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
          {modoColocar && (
            <div className="croquis-modo-aviso">
              {productoSeleccionado
                ? `Tocá una celda para agregar: ${productoSeleccionado.tipoHuevo} ${productoSeleccionado.tamaño}`
                : "Tocá la celda de destino para mover el producto"}
              <button
                type="button"
                onClick={() => {
                  setProductoSeleccionado(null);
                  setChipParaMover(null);
                }}
              >
                Cancelar
              </button>
            </div>
          )}

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
            <div className="croquis-toolbar-botones">
              <button onClick={() => setModalCopiar(true)}>
                Copiar desde otro día
              </button>
              <button onClick={() => setModalConfigurar(true)}>
                Reconfigurar tamaño
              </button>
            </div>
          </div>

          <div className="croquis-layout">
            <ProductoPaleta
              productos={productos}
              productoSeleccionado={productoSeleccionado}
              onSeleccionar={(p) => {
                setChipParaMover(null);
                setProductoSeleccionado(p);
              }}
            />

            {plantillaMostrada && (
              <CroquisGrid
                plantilla={plantillaMostrada}
                productosPorId={productosPorId}
                productoSeleccionado={productoSeleccionado}
                chipParaMover={chipParaMover}
                onClickCelda={handleClickCelda}
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
          onGuardado={handleConfigurado}
        />
      </Modal>

      <Modal
        isOpen={modalCopiar}
        onClose={() => setModalCopiar(false)}
        title={`Copiar croquis hacia ${labelDia} (${fechaSeleccionada})`}
      >
        <CopiarDiaModal
          vehiculoId={vehiculoId}
          fechaDestino={fechaSeleccionada}
          onClose={() => setModalCopiar(false)}
          onCopiado={handleCopiado}
        />
      </Modal>

      <Modal
        isOpen={!!celdaParaAgregar}
        onClose={() => setCeldaParaAgregar(null)}
        title="Agregar producto a la celda"
      >
        {celdaParaAgregar && productoSeleccionado && (
          <AgregarCantidadModal
            celdaId={celdaParaAgregar}
            producto={productoSeleccionado}
            fecha={fechaSeleccionada}
            onClose={() => setCeldaParaAgregar(null)}
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
            onIniciarMover={handleIniciarMover}
          />
        )}
      </Modal>
    </div>
  );
}
