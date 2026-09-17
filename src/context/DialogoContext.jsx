import { createContext, useCallback, useContext, useRef, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";

const DialogoContext = createContext(null);

export function DialogoProvider({ children }) {
  const [dialogo, setDialogo] = useState(null);
  const resolverRef = useRef(null);

  const cerrar = useCallback((resultado) => {
    setDialogo(null);
    if (resolverRef.current) {
      resolverRef.current(resultado);
      resolverRef.current = null;
    }
  }, []);

  const confirmar = useCallback((mensaje, opciones = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogo({
        variante: "confirmar",
        mensaje,
        titulo: opciones.titulo ?? "Confirmar acción",
        textoConfirmar: opciones.textoConfirmar ?? "Confirmar",
        textoCancelar: opciones.textoCancelar ?? "Cancelar",
        peligro: opciones.peligro ?? false,
      });
    });
  }, []);

  const avisar = useCallback((mensaje, opciones = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogo({
        variante: "avisar",
        mensaje,
        titulo: opciones.titulo ?? "Aviso",
        textoConfirmar: opciones.textoConfirmar ?? "Aceptar",
        peligro: opciones.peligro ?? false,
      });
    });
  }, []);

  return (
    <DialogoContext.Provider value={{ confirmar, avisar }}>
      {children}
      {dialogo && (
        <ConfirmDialog
          isOpen
          {...dialogo}
          onConfirmar={() => cerrar(true)}
          onCancelar={() => cerrar(false)}
        />
      )}
    </DialogoContext.Provider>
  );
}

export function useDialogo() {
  const ctx = useContext(DialogoContext);
  if (!ctx) {
    throw new Error("useDialogo debe usarse dentro de un DialogoProvider");
  }
  return ctx;
}
