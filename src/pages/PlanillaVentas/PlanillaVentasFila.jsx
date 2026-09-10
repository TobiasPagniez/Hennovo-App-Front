import { formatMoney } from "../../utils/formatMoney";

export default function PlanillaVentasFila({
  cliente,
  puedeEditar,
  esPrimero,
  esUltimo,
  onTogglePagado,
  onCargarPedido,
  onVerTopes,
  onMoverArriba,
  onMoverAbajo,
}) {
  const tienePedido = !!cliente.pedidoId;
  const cant = cliente.cantidades;

  return (
    <tr className={!tienePedido ? "fila-inactiva" : ""}>
      <td className="planilla-col-fija">
        <div className="planilla-cliente-celda">
          {puedeEditar && (
            <div className="planilla-orden-botones">
              <button
                type="button"
                disabled={esPrimero}
                onClick={() => onMoverArriba(cliente)}
                title="Subir"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={esUltimo}
                onClick={() => onMoverAbajo(cliente)}
                title="Bajar"
              >
                ↓
              </button>
            </div>
          )}
          <span className="celda-destacada">{cliente.clienteNombre}</span>
        </div>
      </td>
      <td className="planilla-celda-check">
        {tienePedido ? (
          <input
            type="checkbox"
            checked={!!cliente.pagado}
            onChange={() => onTogglePagado(cliente)}
            title="Pagado"
          />
        ) : (
          "-"
        )}
      </td>
      <td>
        {cliente.topes.length > 0 ? (
          <button
            type="button"
            className="planilla-link-boton"
            onClick={() => onVerTopes(cliente)}
          >
            Ver tope
          </button>
        ) : (
          "-"
        )}
      </td>
      <td>{cliente.banco || "-"}</td>
      <td>{tienePedido ? `$ ${formatMoney(cliente.saldoPendiente)}` : "-"}</td>
      <td>{tienePedido ? `$ ${formatMoney(cliente.totalPedido)}` : "-"}</td>
      <td className="planilla-celda-cantidad">{cant.t1Color || "-"}</td>
      <td className="planilla-celda-cantidad">{cant.t1Blanco || "-"}</td>
      <td className="planilla-celda-cantidad">{cant.t2Color || "-"}</td>
      <td className="planilla-celda-cantidad">{cant.t2Blanco || "-"}</td>
      <td className="planilla-celda-cantidad">{cant.t3Color || "-"}</td>
      <td className="planilla-celda-cantidad">{cant.t3Blanco || "-"}</td>
      <td className="planilla-celda-cantidad">{cant.otros || "-"}</td>
      <td>
        {tienePedido ? (
          <span className="badge badge-activo">Cargado</span>
        ) : (
          <button type="button" onClick={() => onCargarPedido(cliente)}>
            + Cargar pedido
          </button>
        )}
      </td>
    </tr>
  );
}
