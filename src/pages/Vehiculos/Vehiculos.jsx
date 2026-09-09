import { useEffect, useState } from "react";
import {
  obtenerVehiculosTodos,
  desactivarVehiculo,
  reactivarVehiculo,
} from "../../services/vehiculoService";
import { estadoGeneralVehiculo, estadoDeFecha, estadoDeKm } from "../../utils/vehiculoEstado";
import Modal from "../../components/Modal/Modal";
import VehiculoCrearModal from "./VehiculoCrearModal";
import VehiculoEditModal from "./VehiculoEditModal";
import KilometrajeModal from "./KilometrajeModal";
import "./Vehiculos.css";

function claseEstado(estado) {
  if (estado === "vencido") return "texto-vencido";
  if (estado === "proximo") return "texto-proximo";
  return "";
}

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(true);
  const [soloAlertas, setSoloAlertas] = useState(false);

  const [modalCrear, setModalCrear] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState(null);
  const [vehiculoKilometraje, setVehiculoKilometraje] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerVehiculosTodos();
      setVehiculos(data);
    } catch {
      setError("No se pudieron cargar los vehículos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleDesactivar(vehiculo) {
    const confirmar = window.confirm(
      `¿Seguro que querés desactivar el vehículo "${vehiculo.patente}"?`
    );
    if (!confirmar) return;
    try {
      await desactivarVehiculo(vehiculo.id);
      cargar();
    } catch {
      alert("No se pudo desactivar el vehículo.");
    }
  }

  async function handleReactivar(vehiculo) {
    try {
      await reactivarVehiculo(vehiculo.id);
      cargar();
    } catch {
      alert("No se pudo reactivar el vehículo.");
    }
  }

  function handleGuardadoCrear() {
    setModalCrear(false);
    cargar();
  }

  function handleGuardadoEdit() {
    setVehiculoEditando(null);
    cargar();
  }

  function handleGuardadoKilometraje() {
    setVehiculoKilometraje(null);
    cargar();
  }

  let vehiculosVisibles = mostrarInactivos
    ? vehiculos
    : vehiculos.filter((v) => v.activo);

  if (soloAlertas) {
    vehiculosVisibles = vehiculosVisibles.filter(
      (v) => estadoGeneralVehiculo(v) !== "ok"
    );
  }

  return (
    <div className="vehiculos-page">
      <div className="page-header">
        <h1>Vehículos</h1>
        <button className="btn-primario" onClick={() => setModalCrear(true)}>
          Nuevo vehículo
        </button>
      </div>

      <div className="vehiculos-toolbar">
        <label className="toggle-checkbox">
          <input
            type="checkbox"
            checked={mostrarInactivos}
            onChange={(e) => setMostrarInactivos(e.target.checked)}
          />
          Mostrar inactivos
        </label>
        <label className="toggle-checkbox">
          <input
            type="checkbox"
            checked={soloAlertas}
            onChange={(e) => setSoloAlertas(e.target.checked)}
          />
          Mostrar solo vencidos / próximos a vencer
        </label>
      </div>

      <div className="vehiculos-referencias">
        <span className="vehiculos-referencia-item">
          <span className="vehiculos-referencia-color vencido"></span> Vencido
        </span>
        <span className="vehiculos-referencia-item">
          <span className="vehiculos-referencia-color proximo"></span> Próximo a vencer
        </span>
      </div>

      {error && <p className="estado-error">{error}</p>}

      {cargando ? (
        <p className="estado-cargando">Cargando vehículos...</p>
      ) : (
        <div className="tabla-wrapper vehiculos-tabla-wrapper">
          <table className="tabla-base vehiculos-tabla">
            <thead>
              <tr>
                <th>Patente</th>
                <th>Marca / Modelo</th>
                <th>Kilometraje</th>
                <th>Service</th>
                <th>Seguro</th>
                <th>ITV</th>
                <th>SENASA</th>
                <th>Aceite (km)</th>
                <th>Rotación (km)</th>
                <th>Correa (km)</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculosVisibles.map((v) => (
                <tr key={v.id} className={!v.activo ? "fila-inactiva" : ""}>
                  <td className="celda-destacada">{v.patente}</td>
                  <td>
                    {v.marca} {v.modelo}
                  </td>
                  <td>{v.kilometrajeActual} km</td>
                  <td className={claseEstado(estadoDeFecha(v.proximoServiceFecha))}>
                    {v.proximoServiceFecha || "-"}
                  </td>
                  <td className={claseEstado(estadoDeFecha(v.vencimientoSeguro))}>
                    {v.vencimientoSeguro || "-"}
                  </td>
                  <td className={claseEstado(estadoDeFecha(v.vencimientoItv))}>
                    {v.vencimientoItv || "-"}
                  </td>
                  <td className={claseEstado(estadoDeFecha(v.vencimientoSenasa))}>
                    {v.vencimientoSenasa || "-"}
                  </td>
                  <td
                    className={claseEstado(
                      estadoDeKm(v.kilometrajeActual, v.proximoCambioAceiteKm)
                    )}
                  >
                    {v.proximoCambioAceiteKm || "-"}
                  </td>
                  <td
                    className={claseEstado(
                      estadoDeKm(v.kilometrajeActual, v.proximaRotacionAlineadoKm)
                    )}
                  >
                    {v.proximaRotacionAlineadoKm || "-"}
                  </td>
                  <td
                    className={claseEstado(
                      estadoDeKm(v.kilometrajeActual, v.proximoCambioCorreaKm)
                    )}
                  >
                    {v.proximoCambioCorreaKm || "-"}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        v.activo ? "badge-activo" : "badge-inactivo"
                      }`}
                    >
                      {v.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="acciones-fila">
                    <button onClick={() => setVehiculoEditando(v)}>
                      Editar
                    </button>
                    <button onClick={() => setVehiculoKilometraje(v)}>
                      Kilometraje
                    </button>
                    {v.activo ? (
                      <button onClick={() => handleDesactivar(v)}>
                        Desactivar
                      </button>
                    ) : (
                      <button onClick={() => handleReactivar(v)}>
                        Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {vehiculosVisibles.length === 0 && (
                <tr className="fila-vacia">
                  <td colSpan={12}>No hay vehículos para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalCrear}
        onClose={() => setModalCrear(false)}
        title="Nuevo vehículo"
      >
        <VehiculoCrearModal
          onClose={() => setModalCrear(false)}
          onSaved={handleGuardadoCrear}
        />
      </Modal>

      <Modal
        isOpen={!!vehiculoEditando}
        onClose={() => setVehiculoEditando(null)}
        title="Editar vehículo"
      >
        {vehiculoEditando && (
          <VehiculoEditModal
            vehiculo={vehiculoEditando}
            onClose={() => setVehiculoEditando(null)}
            onSaved={handleGuardadoEdit}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!vehiculoKilometraje}
        onClose={() => setVehiculoKilometraje(null)}
        title={`Kilometraje — ${vehiculoKilometraje?.patente ?? ""}`}
      >
        {vehiculoKilometraje && (
          <KilometrajeModal
            vehiculo={vehiculoKilometraje}
            onClose={() => setVehiculoKilometraje(null)}
            onSaved={handleGuardadoKilometraje}
          />
        )}
      </Modal>
    </div>
  );
}
