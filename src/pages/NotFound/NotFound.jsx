import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <SearchX size={48} className="notfound-icon" />
        <h1 className="notfound-titulo">Página no encontrada</h1>
        <p className="notfound-texto">
          La página que buscás no existe o fue movida.
        </p>
        <Link to="/" className="btn-primario notfound-link">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
