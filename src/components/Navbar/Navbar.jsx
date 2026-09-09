import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

export default function Navbar({ onAbrirMenu }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <button className="navbar-menu-btn" onClick={onAbrirMenu} title="Abrir menú">
        <Menu size={22} />
      </button>

      <div className="navbar-usuario">
        <Link to="/perfil" className="navbar-nombre-link">
          {usuario?.nombre} {usuario?.apellido}
        </Link>
        <span className="navbar-rol">{usuario?.rol}</span>
      </div>

      <button onClick={handleLogout} className="navbar-logout">
        Cerrar sesión
      </button>
    </header>
  );
}
