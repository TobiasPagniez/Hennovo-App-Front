import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import "./MainLayout.css";

const STORAGE_KEY = "sidebar_colapsado";

export default function MainLayout() {
  const [colapsado, setColapsado] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(colapsado));
  }, [colapsado]);

  return (
    <div className="main-layout">
      <Sidebar colapsado={colapsado} onToggle={() => setColapsado((c) => !c)} />
      <div className="main-content-wrapper">
        <Navbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
