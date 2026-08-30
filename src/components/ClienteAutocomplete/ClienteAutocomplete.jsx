import { useEffect, useRef, useState } from "react";
import { buscarClientesPorNombre } from "../../services/clienteService";
import { useDebounce } from "../../hooks/useDebounce";
import "./ClienteAutocomplete.css";

export default function ClienteAutocomplete({
  clienteSeleccionado,
  onSeleccionar,
  error,
}) {
  const [texto, setTexto] = useState(clienteSeleccionado?.nombre ?? "");
  const [resultados, setResultados] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const contenedorRef = useRef(null);

  const textoDebounced = useDebounce(texto, 300);

  // Si el cliente seleccionado cambia desde afuera (ej: modo edicion), sincronizamos el texto
  useEffect(() => {
    setTexto(clienteSeleccionado?.nombre ?? "");
  }, [clienteSeleccionado]);

  useEffect(() => {
    async function buscar() {
      if (!textoDebounced.trim() || textoDebounced === clienteSeleccionado?.nombre) {
        setResultados([]);
        return;
      }
      setBuscando(true);
      try {
        const data = await buscarClientesPorNombre(textoDebounced.trim());
        setResultados(data.filter((c) => c.activo));
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textoDebounced]);

  useEffect(() => {
    function handleClickFuera(e) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setMostrarLista(false);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  function handleChange(e) {
    setTexto(e.target.value);
    setMostrarLista(true);
    if (clienteSeleccionado) {
      onSeleccionar(null);
    }
  }

  function handleSeleccionar(cliente) {
    setTexto(cliente.nombre);
    setResultados([]);
    setMostrarLista(false);
    onSeleccionar(cliente);
  }

  return (
    <div className="cliente-autocomplete" ref={contenedorRef}>
      <input
        type="text"
        placeholder="Buscar cliente por nombre..."
        value={texto}
        onChange={handleChange}
        onFocus={() => setMostrarLista(true)}
        autoComplete="off"
      />
      {error && <span className="form-error">{error}</span>}

      {mostrarLista && (buscando || resultados.length > 0) && (
        <ul className="cliente-autocomplete-lista">
          {buscando && (
            <li className="cliente-autocomplete-info">Buscando...</li>
          )}
          {!buscando &&
            resultados.map((cliente) => (
              <li key={cliente.id} onClick={() => handleSeleccionar(cliente)}>
                {cliente.nombre}
                <span className="cliente-autocomplete-detalle">
                  {cliente.localidad} — Cat. {cliente.nombreCategoria}
                </span>
              </li>
            ))}
          {!buscando &&
            resultados.length === 0 &&
            textoDebounced.trim() && (
              <li className="cliente-autocomplete-info">Sin resultados</li>
            )}
        </ul>
      )}
    </div>
  );
}
