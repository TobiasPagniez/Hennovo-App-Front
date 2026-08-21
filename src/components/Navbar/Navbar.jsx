import { useNavigate } from "react-router-dom";
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
        <span>{usuario?.nombre} {usuario?.apellido}</span>
        <span className="navbar-rol">{usuario?.rol}</span>
      </div>
      <button onClick={handleLogout} className="navbar-logout">
        Cerrar sesión
      </button>
    </header>
  );
}
