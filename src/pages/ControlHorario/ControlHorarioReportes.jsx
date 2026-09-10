import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  obtenerResumenPorUsuario,
  obtenerTodosLosRegistros,
  obtenerRegistrosPorUsuario,
} from "../../services/controlHorarioService";
import { obtenerEmpleados } from "../../services/userService";
import { hoyISO, restarMeses, lunesDeLaSemana } from "../../utils/dateUtils";

function inicioDeSemanaISO() {
  return lunesDeLaSemana(hoyISO()).toISOString().split("T")[0];
}

function finDeSemanaISO() {
  const lunes = lunesDeLaSemana(hoyISO());
  const sabado = new Date(lunes);
  sabado.setDate(lunes.getDate() + 5);
  return sabado.toISOString().split("T")[0];
}

export default function ControlHorarioReportes() {
  const [modo, setModo] = useState("semana"); // "semana" | "mes"
  const [desde, setDesde] = useState(inicioDeSemanaISO());
  const [hasta, setHasta] = useState(finDeSemanaISO());

  const [empleados, setEmpleados] = useState([]);
  const [empleadoFiltroId, setEmpleadoFiltroId] = useState(""); // "" = todos

  const [resumen, setResumen] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerEmpleados()
      .then(setEmpleados)
      .catch(() => setEmpleados([]));
  }, []);

  function aplicarModo(nuevoModo) {
    setModo(nuevoModo);
    if (nuevoModo === "semana") {
      setDesde(inicioDeSemanaISO());
      setHasta(finDeSemanaISO());
    } else {
      setDesde(restarMeses(hoyISO(), 1));
      setHasta(hoyISO());
    }
  }

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      if (empleadoFiltroId) {
        // Vista de un solo empleado: no tiene sentido pedir el resumen
        // grupal, armamos nuestro propio total a partir de sus registros.
        const registrosData = await obtenerRegistrosPorUsuario(
          empleadoFiltroId,
          desde,
          hasta
        );
        setRegistros(registrosData);
        setResumen([]);
      } else {
        const [resumenData, registrosData] = await Promise.all([
          obtenerResumenPorUsuario(desde, hasta),
          obtenerTodosLosRegistros(desde, hasta),
        ]);
        setResumen(resumenData);
        setRegistros(registrosData);
      }
    } catch {
      setError("No se pudo cargar el reporte de horas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta, empleadoFiltroId]);

  const totalGeneral = useMemo(() => {
    if (empleadoFiltroId) {
      return registros.reduce((acc, r) => acc + r.horasTrabajadas, 0);
    }
    return resumen.reduce((acc, r) => acc + r.totalHoras, 0);
  }, [resumen, registros, empleadoFiltroId]);

  const empleadoSeleccionado = empleados.find(
    (e) => String(e.id) === String(empleadoFiltroId)
  );

  return (
    <div className="reportes-container">
      <div className="ch-reportes-modo">
        <button
          className={modo === "semana" ? "activo" : ""}
          onClick={() => aplicarModo("semana")}
        >
          Esta semana
        </button>
        <button
          className={modo === "mes" ? "activo" : ""}
          onClick={() => aplicarModo("mes")}
        >
          Último mes
        </button>
      </div>

      <div className="ch-reportes-filtros">
        <div className="reportes-filtro-fechas">
          <div>
            <label>Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div>
            <label>Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
        </div>

        <div className="ch-filtro-empleado">
          <label>Empleado</label>
          <select
            value={empleadoFiltroId}
            onChange={(e) => setEmpleadoFiltroId(e.target.value)}
          >
            <option value="">Todos los empleados</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre} {emp.apellido}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="estado-error">{error}</p>}

      {cargando ? (
        <p className="estado-cargando">Cargando reporte...</p>
      ) : registros.length === 0 && resumen.length === 0 ? (
        <p className="reportes-vacio">
          No hay registros de horario en este período.
        </p>
      ) : (
        <>
          <div className="reportes-resumen">
            <span>
              {empleadoFiltroId
                ? `Total de ${empleadoSeleccionado?.nombre ?? "este empleado"}`
                : "Total de horas del equipo"}
            </span>
            <strong>{totalGeneral.toFixed(2)} hs</strong>
          </div>

          {!empleadoFiltroId && resumen.length > 0 && (
            <div className="reportes-grafico">
              <h3>Horas trabajadas por empleado</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={resumen} margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="usuarioNombre"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 11 }} width={35} />
                  <Tooltip formatter={(value) => `${value} hs`} />
                  <Bar dataKey="totalHoras" fill="#f39c12" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="ch-reportes-detalle">
            <h3>Detalle de registros</h3>
            <div className="tabla-wrapper ch-detalle-wrapper">
              <table className="tabla-base">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Empleado</th>
                    <th>Turno</th>
                    <th>Ingreso</th>
                    <th>Egreso</th>
                    <th>Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {registros
                    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
                    .map((r) => (
                      <tr key={r.id}>
                        <td>{r.fecha}</td>
                        <td>{r.usuarioNombre}</td>
                        <td>{r.turno === "MANANA" ? "Mañana" : "Tarde"}</td>
                        <td>{r.horaIngreso}</td>
                        <td>{r.horaEgreso}</td>
                        <td>{r.horasTrabajadas}</td>
                      </tr>
                    ))}
                  {registros.length === 0 && (
                    <tr className="fila-vacia">
                      <td colSpan={6}>
                        No hay registros para este empleado en el período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
