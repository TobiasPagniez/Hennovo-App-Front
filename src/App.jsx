import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DialogoProvider } from "./context/DialogoContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import MainLayout from "./layouts/MainLayout/MainLayout";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

import Clientes from "./pages/Clientes/Clientes";
import CategoriasCliente from "./pages/CategoriasCliente/CategoriasCliente";

import Productos from "./pages/Productos/Productos";

import Precios from "./pages/Precios/Precios";
import NuevaListaPrecio from "./pages/Precios/NuevaListaPrecio";
import ListaPrecioDetalle from "./pages/Precios/ListaPrecioDetalle";
import EditarListaPrecio from "./pages/Precios/EditarListaPrecio";

import Pedidos from "./pages/Pedidos/Pedidos";
import PedidoForm from "./pages/Pedidos/PedidoForm";

import PedidosHabituales from "./pages/PedidosHabituales/PedidosHabituales";

import Rutas from "./pages/Rutas/Rutas";
import RutaForm from "./pages/Rutas/RutaForm";
import RutaDetalle from "./pages/Rutas/RutaDetalle";

import Pagos from "./pages/Pagos/Pagos";

import Vehiculos from "./pages/Vehiculos/Vehiculos";

import Remitos from "./pages/Remitos/Remitos";
import RemitoNuevo from "./pages/Remitos/RemitoNuevo";
import RemitoDetalle from "./pages/Remitos/RemitoDetalle";

import Usuarios from "./pages/Usuarios/Usuarios";

import Cheques from "./pages/Cheques/Cheques";

import Gastos from "./pages/Gastos/Gastos";
import Perdidas from "./pages/Perdidas/Perdidas";

import ControlHorario from "./pages/ControlHorario/ControlHorario";

import PlanillaVentas from "./pages/PlanillaVentas/PlanillaVentas";

import Croquis from "./pages/Croquis/Croquis";

import Perfil from "./pages/Perfil/Perfil";

import NotFound from "./pages/NotFound/NotFound";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DialogoProvider>
          <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />

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

            <Route
              path="/precios"
              element={
                <ProtectedRoute rolesPermitidos={["ADMIN"]}>
                  <Precios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/precios/nueva"
              element={
                <ProtectedRoute rolesPermitidos={["ADMIN"]}>
                  <NuevaListaPrecio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/precios/:id"
              element={
                <ProtectedRoute rolesPermitidos={["ADMIN"]}>
                  <ListaPrecioDetalle />
                </ProtectedRoute>
              }
            />
            <Route path="/precios/:id/editar" element={<EditarListaPrecio />} />

            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/pedidos/nuevo" element={<PedidoForm />} />
            <Route path="/pedidos/:id/editar" element={<PedidoForm />} />

            <Route path="/pedidos-habituales" element={<PedidosHabituales />} />

            <Route path="/rutas" element={<Rutas />} />
            <Route path="/rutas/:id" element={<RutaDetalle />} />
            <Route
              path="/rutas/nueva"
              element={
                <ProtectedRoute rolesPermitidos={["ADMIN"]}>
                  <RutaForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rutas/:id/editar"
              element={
                <ProtectedRoute rolesPermitidos={["ADMIN"]}>
                  <RutaForm />
                </ProtectedRoute>
              }
            />

            <Route path="/pagos" element={<Pagos />} />

            <Route path="/vehiculos" element={<Vehiculos />} />

            <Route path="/remitos" element={<Remitos />} />
            <Route path="/remitos/nuevo" element={<RemitoNuevo />} />
            <Route path="/remitos/:id" element={<RemitoDetalle />} />

            <Route
              path="/usuarios"
              element={
                <ProtectedRoute rolesPermitidos={["ADMIN"]}>
                  <Usuarios />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cheques"
              element={
                <ProtectedRoute rolesPermitidos={["ADMIN"]}>
                  <Cheques />
                </ProtectedRoute>
              }
            />

            <Route path="/gastos" element={<Gastos />} />
            <Route path="/perdidas" element={<Perdidas />} />

            <Route path="/control-horario" element={<ControlHorario />} />

            <Route path="/planilla-ventas" element={<PlanillaVentas />} />

            <Route path="/croquis" element={<Croquis />} />

            <Route path="/perfil" element={<Perfil />} />

            <Route path="*" element={<NotFound />} />
          </Route>
          </Routes>
        </DialogoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
