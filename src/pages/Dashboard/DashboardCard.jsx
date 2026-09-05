import { Link } from "react-router-dom";

export default function DashboardCard({
  titulo,
  valor,
  subtitulo,
  cargando,
  linkTo,
  linkLabel,
  variante = "normal",
}) {
  return (
    <div className={`dashboard-card dashboard-card-${variante}`}>
      <span className="dashboard-card-titulo">{titulo}</span>
      {cargando ? (
        <span className="dashboard-card-cargando">...</span>
      ) : (
        <strong className="dashboard-card-valor">{valor}</strong>
      )}
      {subtitulo && <span className="dashboard-card-subtitulo">{subtitulo}</span>}
      {linkTo && (
        <Link to={linkTo} className="dashboard-card-link">
          {linkLabel ?? "Ver más"} →
        </Link>
      )}
    </div>
  );
}
