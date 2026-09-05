import { useAuth } from "../../context/AuthContext";
import CambiarPasswordForm from "./CambiarPasswordForm";
import "./Perfil.css";

export default function Perfil() {
  const { usuario } = useAuth();

  return (
    <div className="perfil-page">
      <h1>Mi perfil</h1>

      <div className="perfil-datos">
        <p>
          <strong>Nombre:</strong> {usuario?.nombre} {usuario?.apellido}
        </p>
        <p>
          <strong>Email:</strong> {usuario?.email}
        </p>
        <p>
          <strong>Rol:</strong> {usuario?.rol}
        </p>
      </div>

      <CambiarPasswordForm />
    </div>
  );
}
