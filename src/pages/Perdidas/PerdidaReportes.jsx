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
import { obtenerPerdidas } from "../../services/perdidaService";
import { hoyISO, restarMeses } from "../../utils/dateUtils";

export default function PerdidaReportes() {
  const [desde, setDesde] = useState(restarMeses(hoyISO(), 6));
  const [hasta, setHasta] = useState(hoyISO());
  const [perdidas, setPerdidas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerPerdidas(desde, hasta);
      setPerdidas(data);
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

  const totalUnidades = useMemo(
    () => perdidas.reduce((acc, p) => acc + Number(p.cantidad), 0),
    [perdidas]
  );

  const porProducto = useMemo(() => {
    const mapa = {};
    for (const p of perdidas) {
      mapa[p.producto] = (mapa[p.producto] ?? 0) + Number(p.cantidad);
    }
    return Object.entries(mapa)
      .map(([producto, cantidad]) => ({ producto, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [perdidas]);

  const porMotivo = useMemo(() => {
    const mapa = {};
    for (const p of perdidas) {
      mapa[p.motivo] = (mapa[p.motivo] ?? 0) + Number(p.cantidad);
    }
    return Object.entries(mapa)
      .map(([motivo, cantidad]) => ({ motivo, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [perdidas]);

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

      {error && <p className="estado-error">{error}</p>}

      {cargando ? (
        <p className="estado-cargando">Cargando reporte...</p>
      ) : perdidas.length === 0 ? (
        <p className="reportes-vacio">
          No hay pérdidas registradas en este período.
        </p>
      ) : (
        <>
          <div className="reportes-resumen">
            <span>Unidades perdidas en el período</span>
            <strong>{totalUnidades}</strong>
          </div>

          <div className="reportes-grafico">
            <h3>Pérdidas por producto</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={porProducto} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="producto" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={55} />
                <YAxis tick={{ fontSize: 11 }} width={35} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#c0392b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="reportes-grafico">
            <h3>Pérdidas por motivo</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={porMotivo} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="motivo" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={55} />
                <YAxis tick={{ fontSize: 11 }} width={35} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#8a5a1f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
