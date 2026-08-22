import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const modulos = [
  { path: "/", label: "Dashboard", roles: ["ADMIN", "EMPLEADO"] },
  { path: "/clientes", label: "Clientes", roles: ["ADMIN", "EMPLEADO"] },
  { path: "/categorias-clientes", label: "Categorías de cliente", roles: ["ADMIN"] },
  { path: "/productos", label: "Productos", roles: ["ADMIN", "EMPLEADO"] },
  { path: "/precios", label: "Precios", roles: ["ADMIN"] },
  { path: "/pedidos", label: "Pedidos", roles: ["ADMIN", "EMPLEADO"] },
  { path: "/rutas", label: "Rutas", roles: ["ADMIN", "EMPLEADO"] },
  { path: "/pagos", label: "Pagos", roles: ["ADMIN", "EMPLEADO"] },
  { path: "/vehiculos", label: "Vehículos", roles: ["ADMIN", "EMPLEADO"] },
  { path: "/remitos", label: "Remitos", roles: ["ADMIN", "EMPLEADO"] },
  { path: "/usuarios", label: "Usuarios", roles: ["ADMIN"] },
  { path: "/gastos", label: "Gastos", roles: ["ADMIN"] },
  { path: "/perdidas", label: "Pérdidas", roles: ["ADMIN", "EMPLEADO"] },
  { path: "/control-horario", label: "Control horario", roles: ["ADMIN", "EMPLEADO"] },
];
export default function Sidebar() {
  const { usuario } = useAuth();

  const modulosVisibles = modulos.filter((m) =>
    m.roles.includes(usuario?.rol)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Hennovo</div>
      <nav className="sidebar-nav">
        {modulosVisibles.map((m) => (
          <NavLink
            key={m.path}
            to={m.path}
            end={m.path === "/"}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            {m.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
