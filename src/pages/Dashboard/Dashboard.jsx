import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardCard from "./DashboardCard";
import { obtenerPedidos } from "../../services/pedidoService";
import { obtenerVencimientos } from "../../services/vehiculoService";
import { obtenerGastos } from "../../services/gastoService";
import { obtenerCheques } from "../../services/chequeService";
import { obtenerResumenPorUsuario } from "../../services/controlHorarioService";
import { formatMoney } from "../../utils/formatMoney";
import {
  hoyISO,
  inicioDeMes,
  sumarDias,
  lunesDeLaSemana,
} from "../../utils/dateUtils";
import "./Dashboard.css";

function finDeSemanaISO() {
  const lunes = lunesDeLaSemana(hoyISO());
  const sabado = new Date(lunes);
  sabado.setDate(lunes.getDate() + 5);
  return sabado.toISOString().split("T")[0];
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "ADMIN";

  const [pedidosHoy, setPedidosHoy] = useState(null);
  const [vencimientosVehiculos, setVencimientosVehiculos] = useState(null);
  const [gastosMes, setGastosMes] = useState(null);
  const [chequesProximos, setChequesProximos] = useState(null);
  const [horasEquipo, setHorasEquipo] = useState(null);

  const [cargandoOperativo, setCargandoOperativo] = useState(true);
  const [cargandoAdmin, setCargandoAdmin] = useState(esAdmin);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarOperativo() {
      setCargandoOperativo(true);
      try {
        const [pedidos, vencimientos] = await Promise.all([
          obtenerPedidos(hoyISO()),
          obtenerVencimientos(15),
        ]);

        const totalHoy = pedidos.reduce((acc, p) => acc + Number(p.total), 0);
        const entregados = pedidos.filter((p) => p.entregado).length;

        setPedidosHoy({
          cantidad: pedidos.length,
          entregados,
          pendientes: pedidos.length - entregados,
          total: totalHoy,
        });

        setVencimientosVehiculos(vencimientos.length);
      } catch {
        setError("No se pudo cargar toda la información del dashboard.");
      } finally {
        setCargandoOperativo(false);
      }
    }

    cargarOperativo();
  }, []);

  useEffect(() => {
    if (!esAdmin) return;

    async function cargarAdmin() {
      setCargandoAdmin(true);
      try {
        const hoy = hoyISO();

        const [gastos, cheques, resumenHoras] = await Promise.all([
          obtenerGastos(inicioDeMes(hoy), hoy),
          obtenerCheques(),
          obtenerResumenPorUsuario(lunesDeLaSemana(hoy).toISOString().split("T")[0], finDeSemanaISO()),
        ]);

        const totalGastosMes = gastos.reduce((acc, g) => acc + Number(g.importe), 0);
        setGastosMes(totalGastosMes);

        const limite = sumarDias(hoy, 7);
        const proximos = cheques.filter(
          (c) => c.activo && c.fechaPago >= hoy && c.fechaPago <= limite
        );
        setChequesProximos({
          cantidad: proximos.length,
          total: proximos.reduce((acc, c) => acc + Number(c.importe), 0),
        });

        const totalHoras = resumenHoras.reduce((acc, r) => acc + r.totalHoras, 0);
        setHorasEquipo(totalHoras);
      } catch {
        setError((prev) => prev ?? "No se pudo cargar la información administrativa.");
      } finally {
        setCargandoAdmin(false);
      }
    }

    cargarAdmin();
  }, [esAdmin]);

  return (
    <div className="dashboard-page">
      <h1>Hola, {usuario?.nombre} </h1>

      {error && <p className="dashboard-error">{error}</p>}

      <section>
        <h2 className="dashboard-seccion-titulo">Hoy</h2>
        <div className="dashboard-grid">
          <DashboardCard
            titulo="Pedidos de hoy"
            cargando={cargandoOperativo}
            valor={pedidosHoy?.cantidad ?? 0}
            subtitulo={
              pedidosHoy
                ? `${pedidosHoy.entregados} entregados · ${pedidosHoy.pendientes} pendientes`
                : ""
            }
            linkTo="/pedidos"
            linkLabel="Ver pedidos"
          />
          <DashboardCard
            titulo="Total facturado hoy"
            cargando={cargandoOperativo}
            valor={pedidosHoy ? `$ ${formatMoney(pedidosHoy.total)}` : "$ 0"}
            linkTo="/planilla-ventas"
            linkLabel="Ir a la planilla"
          />
          <DashboardCard
            titulo="Vehículos con vencimientos"
            cargando={cargandoOperativo}
            valor={vencimientosVehiculos ?? 0}
            subtitulo="Próximos 15 días o 1000 km"
            variante={vencimientosVehiculos > 0 ? "alerta" : "normal"}
            linkTo="/vehiculos"
            linkLabel="Ver vehículos"
          />
        </div>
      </section>

      {esAdmin && (
        <section>
          <h2 className="dashboard-seccion-titulo">Administración</h2>
          <div className="dashboard-grid">
            <DashboardCard
              titulo="Gastos del mes"
              cargando={cargandoAdmin}
              valor={gastosMes !== null ? `$ ${formatMoney(gastosMes)}` : "$ 0"}
              linkTo="/gastos"
              linkLabel="Ver gastos"
            />
            <DashboardCard
              titulo="Cheques por cobrar (7 días)"
              cargando={cargandoAdmin}
              valor={chequesProximos?.cantidad ?? 0}
              subtitulo={
                chequesProximos
                  ? `$ ${formatMoney(chequesProximos.total)}`
                  : ""
              }
              variante={chequesProximos?.cantidad > 0 ? "alerta" : "normal"}
              linkTo="/cheques"
              linkLabel="Ver cheques"
            />
            <DashboardCard
              titulo="Horas del equipo esta semana"
              cargando={cargandoAdmin}
              valor={horasEquipo !== null ? `${horasEquipo.toFixed(1)} hs` : "0 hs"}
              linkTo="/control-horario"
              linkLabel="Ver reporte"
            />
          </div>
        </section>
      )}

      <section>
        <h2 className="dashboard-seccion-titulo">Accesos rápidos</h2>
        <div className="dashboard-accesos">
          <a href="/pedidos/nuevo" className="dashboard-acceso">
            + Nuevo pedido
          </a>
          <a href="/planilla-ventas" className="dashboard-acceso">
            Planilla de ventas
          </a>
          <a href="/croquis" className="dashboard-acceso">
            Croquis de carga
          </a>
          <a href="/clientes" className="dashboard-acceso">
            Clientes
          </a>
          {esAdmin && (
            <a href="/precios/nueva" className="dashboard-acceso">
              Nueva lista de precios
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
