import { AlertTriangle, HelpCircle } from "lucide-react";
import "./ConfirmDialog.css";

export default function ConfirmDialog({
  isOpen,
  variante = "confirmar",
  titulo,
  mensaje,
  textoConfirmar,
  textoCancelar,
  peligro,
  onConfirmar,
  onCancelar,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="confirm-overlay"
      onClick={variante === "avisar" ? onConfirmar : onCancelar}
    >
      <div className="confirm-content" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-icono ${peligro ? "confirm-icono-peligro" : ""}`}>
          {peligro ? <AlertTriangle size={22} /> : <HelpCircle size={22} />}
        </div>
        {titulo && <h2 className="confirm-titulo">{titulo}</h2>}
        <p className="confirm-mensaje">{mensaje}</p>
        <div className="confirm-acciones">
          {variante === "confirmar" && (
            <button className="confirm-btn confirm-btn-cancelar" onClick={onCancelar}>
              {textoCancelar}
            </button>
          )}
          <button
            className={`confirm-btn ${peligro ? "confirm-btn-peligro" : "confirm-btn-confirmar"}`}
            onClick={onConfirmar}
            autoFocus
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
