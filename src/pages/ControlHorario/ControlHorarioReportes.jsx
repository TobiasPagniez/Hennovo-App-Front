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
} from "../../services/controlHorarioService";
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
  const [resumen, setResumen] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

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
      const [resumenData, registrosData] = await Promise.all([
        obtenerResumenPorUsuario(desde, hasta),
        obtenerTodosLosRegistros(desde, hasta),
      ]);
      setResumen(resumenData);
      setRegistros(registrosData);
    } catch {
      setError("No se pudo cargar el reporte de horas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta]);

  const totalGeneral = useMemo(
    () => resumen.reduce((acc, r) => acc + r.totalHoras, 0),
    [resumen]
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

      {error && <p className="reportes-error">{error}</p>}

      {cargando ? (
        <p>Cargando reporte...</p>
      ) : resumen.length === 0 ? (
        <p>No hay registros de horario en este período.</p>
      ) : (
        <>
          <div className="reportes-resumen">
            <span>Total de horas del equipo</span>
            <strong>{totalGeneral.toFixed(2)} hs</strong>
          </div>

          <div className="reportes-grafico">
            <h3>Horas trabajadas por empleado</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resumen}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="usuarioNombre" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value} hs`} />
                <Bar dataKey="totalHoras" fill="#3d5c48" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="ch-reportes-detalle">
            <h3>Detalle de registros</h3>
            <table className="ch-tabla">
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
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
