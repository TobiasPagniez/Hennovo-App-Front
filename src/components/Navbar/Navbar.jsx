import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
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
