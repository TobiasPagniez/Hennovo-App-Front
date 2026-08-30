import {
  labelTipoHuevo,
  labelTamaño,
  labelPresentacion,
} from "./productoLabels";

export function nombreProducto(producto) {
  return `${labelPresentacion(producto.presentacion)} ${labelTipoHuevo(
    producto.tipoHuevo
  )} ${labelTamaño(producto.tamaño)}`;
}
