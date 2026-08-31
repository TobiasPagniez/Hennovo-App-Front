import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { obtenerGastos } from "../../services/gastoService";
import { formatMoney } from "../../utils/formatMoney";
import { hoyISO, restarMeses } from "../../utils/dateUtils";

export default function GastoReportes() {
  const [desde, setDesde] = useState(restarMeses(hoyISO(), 6));
  const [hasta, setHasta] = useState(hoyISO());
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerGastos(desde, hasta);
      setGastos(data);
    } catch {
      setError("No se pudieron cargar los datos del reporte.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta]);

  const totalPeriodo = useMemo(
    () => gastos.reduce((acc, g) => acc + Number(g.importe), 0),
    [gastos]
  );

  const porCategoria = useMemo(() => {
    const mapa = {};
    for (const g of gastos) {
      mapa[g.categoria] = (mapa[g.categoria] ?? 0) + Number(g.importe);
    }
    return Object.entries(mapa)
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);
  }, [gastos]);

  const porMes = useMemo(() => {
    const mapa = {};
    for (const g of gastos) {
      const clave = g.fecha.slice(0, 7);
      mapa[clave] = (mapa[clave] ?? 0) + Number(g.importe);
    }
    return Object.entries(mapa)
      .map(([mes, total]) => ({ mes, total }))
      .sort((a, b) => (a.mes < b.mes ? -1 : 1));
  }, [gastos]);

  return (
    <div className="reportes-container">
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
      ) : gastos.length === 0 ? (
        <p>No hay gastos registrados en este período.</p>
      ) : (
        <>
          <div className="reportes-resumen">
            <span>Total del período</span>
            <strong>$ {formatMoney(totalPeriodo)}</strong>
          </div>

          <div className="reportes-grafico">
            <h3>Gastos por categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={porCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `$ ${formatMoney(value)}`} />
                <Bar dataKey="total" fill="#3d5c48" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="reportes-grafico">
            <h3>Evolución mensual</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={porMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `$ ${formatMoney(value)}`} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#e08e3e"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
