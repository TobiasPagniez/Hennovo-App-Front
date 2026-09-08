import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import "./MainLayout.css";

const STORAGE_KEY = "sidebar_colapsado";

export default function MainLayout() {
  const [colapsado, setColapsado] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });
  const [abiertoMobile, setAbiertoMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(colapsado));
  }, [colapsado]);

  // Cierra el drawer mobile automaticamente al cambiar de pagina
  useEffect(() => {
    setAbiertoMobile(false);
  }, [location.pathname]);

  return (
    <div className="main-layout">
      <Sidebar
        colapsado={colapsado}
        onToggle={() => setColapsado((c) => !c)}
        abiertoMobile={abiertoMobile}
        onCerrarMobile={() => setAbiertoMobile(false)}
      />

      {abiertoMobile && (
        <div
          className="sidebar-overlay"
          onClick={() => setAbiertoMobile(false)}
        />
      )}

      <div className="main-content-wrapper">
        <Navbar onAbrirMenu={() => setAbiertoMobile(true)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
