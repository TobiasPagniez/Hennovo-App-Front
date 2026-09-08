import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Tags,
  Egg,
  DollarSign,
  ShoppingCart,
  Repeat,
  Truck,
  Wallet,
  Car,
  FileText,
  UserCog,
  Landmark,
  Receipt,
  PackageX,
  Clock,
  ClipboardList,
  Grid3x3,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import "./Sidebar.css";

const modulos = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "EMPLEADO"] },
  { path: "/clientes", label: "Clientes", icon: Users, roles: ["ADMIN", "EMPLEADO"] },
  { path: "/categorias-clientes", label: "Categorías de cliente", icon: Tags, roles: ["ADMIN"] },
  { path: "/productos", label: "Productos", icon: Egg, roles: ["ADMIN", "EMPLEADO"] },
  { path: "/precios", label: "Precios", icon: DollarSign, roles: ["ADMIN"] },
  { path: "/pedidos", label: "Pedidos", icon: ShoppingCart, roles: ["ADMIN", "EMPLEADO"] },
  { path: "/pedidos-habituales", label: "Pedidos habituales", icon: Repeat, roles: ["ADMIN", "EMPLEADO"] },
  { path: "/planilla-ventas", label: "Planilla de ventas", icon: ClipboardList, roles: ["ADMIN", "EMPLEADO"] },
  { path: "/rutas", label: "Rutas", icon: Truck, roles: ["ADMIN", "EMPLEADO"] },
  { path: "/pagos", label: "Pagos", icon: Wallet, roles: ["ADMIN", "EMPLEADO"] },
  { path: "/vehiculos", label: "Vehículos", icon: Car, roles: ["ADMIN", "EMPLEADO"] },
  { path: "/croquis", label: "Croquis de carga", icon: Grid3x3, roles: ["ADMIN", "EMPLEADO"] },
  { path: "/remitos", label: "Remitos", icon: FileText, roles: ["ADMIN", "EMPLEADO"] },
  { path: "/usuarios", label: "Usuarios", icon: UserCog, roles: ["ADMIN"] },
  { path: "/cheques", label: "Cheques", icon: Landmark, roles: ["ADMIN"] },
  { path: "/gastos", label: "Gastos", icon: Receipt, roles: ["ADMIN", "EMPLEADO"] },
  { path: "/perdidas", label: "Pérdidas", icon: PackageX, roles: ["ADMIN", "EMPLEADO"] },
  { path: "/control-horario", label: "Control horario", icon: Clock, roles: ["ADMIN", "EMPLEADO"] },
];

export default function Sidebar({ colapsado, onToggle }) {
  const { usuario } = useAuth();

  const modulosVisibles = modulos.filter((m) => m.roles.includes(usuario?.rol));

  return (
    <aside className={`sidebar ${colapsado ? "sidebar-colapsado" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-logo">{colapsado ? "H" : "Hennovo"}</div>
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          title={colapsado ? "Expandir menú" : "Contraer menú"}
        >
          {colapsado ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {modulosVisibles.map((m) => {
          const Icon = m.icon;
          return (
            <NavLink
              key={m.path}
              to={m.path}
              end={m.path === "/"}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
              title={colapsado ? m.label : undefined}
            >
              <Icon size={18} className="sidebar-link-icon" />
              {!colapsado && <span className="sidebar-link-label">{m.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
