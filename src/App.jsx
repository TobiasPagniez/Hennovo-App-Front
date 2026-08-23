import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import MainLayout from "./layouts/MainLayout/MainLayout";
import Login from "./pages/Login/Login";
import Clientes from "./pages/Clientes/Clientes";
import CategoriasCliente from "./pages/CategoriasCliente/CategoriasCliente";
import "./styles/forms.css";
import Productos from "./pages/Productos/Productos";

//sadasd
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<div>Dashboard (placeholder)</div>} />
            <Route path="/clientes" element={<Clientes />} />
            <Route
              path="/categorias-clientes"
              element={
                <ProtectedRoute rolesPermitidos={["ADMIN"]}>
                  <CategoriasCliente />
                </ProtectedRoute>
              }
            />
            <Route path="/productos" element={<Productos />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
