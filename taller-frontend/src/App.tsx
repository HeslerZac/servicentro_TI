import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { MainLayout } from './components/MainLayout'
import { ToastProvider } from './components/ui/Toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { ProductosList } from './pages/productos/ProductosList'
import { ProductoForm } from './pages/productos/ProductoForm'
import { OrdenesList } from './pages/ordenes/OrdenesList'
import { OrdenNueva } from './pages/ordenes/OrdenNueva'
import { OrdenDetalle } from './pages/ordenes/OrdenDetalle'
import { OrdenEditar } from './pages/ordenes/OrdenEditar'
import { Cobro } from './pages/ordenes/Cobro'
import { ClientesList } from './pages/clientes/ClientesList'
import { ClienteForm } from './pages/clientes/ClienteForm'
import { VehiculosList } from './pages/vehiculos/VehiculosList'
import { VehiculoForm } from './pages/vehiculos/VehiculoForm'
import BodegasListado from './pages/bodegas/Listado'
import BodegaForm from './pages/bodegas/Form'
import Existencias from './pages/inventarios/Existencias'
import Ajustes from './pages/inventarios/Ajustes'
import Movimientos from './pages/inventarios/Movimientos'
import VentasListado from './pages/ventas/Listado'
import VentaDetalle from './pages/ventas/Detalle'
import FacturacionListado from './pages/facturacion/Listado'
import CierresListado from './pages/cierres/Listado'
import GenerarCierre from './pages/cierres/Generar'
import Categorias from './pages/catalogos/Categorias'
import Marcas from './pages/catalogos/Marcas'
import Asignacion from './pages/catalogos/Asignacion'
import UsuariosListado from './pages/usuarios/Listado'
import UsuarioForm from './pages/usuarios/Form'
import { Perfil } from './pages/Perfil'
import CajaEstado from './pages/caja/Estado'
import { ProveedoresList } from './pages/proveedores/ProveedoresList'
import { ProveedorForm } from './pages/proveedores/ProveedorForm'
import { RegistroCompra } from './pages/compras/RegistroCompra'
import { Recibo } from './pages/ventas/Recibo'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <ToastProvider>
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}> 
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={
            <RequireAuth roles={["ADMINISTRADOR"]}><Register /></RequireAuth>
          } />

          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />

          <Route path="/productos" element={<RequireAuth><ProductosList /></RequireAuth>} />
          <Route path="/productos/nuevo" element={<RequireAuth roles={["ADMINISTRADOR"]}><ProductoForm mode="create" /></RequireAuth>} />
          <Route path="/productos/:id" element={<RequireAuth roles={["ADMINISTRADOR"]}><ProductoForm mode="edit" /></RequireAuth>} />

          <Route path="/ordenes" element={<RequireAuth><OrdenesList /></RequireAuth>} />
          <Route path="/ordenes/nueva" element={<RequireAuth><OrdenNueva /></RequireAuth>} />
          <Route path="/ordenes/:id" element={<RequireAuth><OrdenDetalle /></RequireAuth>} />
          <Route path="/ordenes/:id/editar" element={<RequireAuth roles={["ADMINISTRADOR","SECRETARIA"]}><OrdenEditar /></RequireAuth>} />
          <Route path="/ordenes/:id/cobro" element={<RequireAuth><Cobro /></RequireAuth>} />
          <Route path="/ventas/:id/recibo" element={<RequireAuth><Recibo /></RequireAuth>} />

          <Route path="/clientes" element={<RequireAuth><ClientesList /></RequireAuth>} />
          <Route path="/clientes/nuevo" element={<RequireAuth roles={["ADMINISTRADOR","SECRETARIA"]}><ClienteForm mode="create" /></RequireAuth>} />
          <Route path="/clientes/:id" element={<RequireAuth roles={["ADMINISTRADOR","SECRETARIA"]}><ClienteForm mode="edit" /></RequireAuth>} />

          <Route path="/vehiculos" element={<RequireAuth><VehiculosList /></RequireAuth>} />
          <Route path="/vehiculos/nuevo" element={<RequireAuth roles={["ADMINISTRADOR","SECRETARIA"]}><VehiculoForm mode="create" /></RequireAuth>} />
          <Route path="/vehiculos/:id" element={<RequireAuth roles={["ADMINISTRADOR","SECRETARIA"]}><VehiculoForm mode="edit" /></RequireAuth>} />

          {/* Nuevos módulos */}
          <Route path="/bodegas" element={<RequireAuth><BodegasListado /></RequireAuth>} />
          <Route path="/bodegas/nueva" element={<RequireAuth roles={["ADMINISTRADOR"]}><BodegaForm mode='create' /></RequireAuth>} />
          <Route path="/bodegas/:id" element={<RequireAuth roles={["ADMINISTRADOR"]}><BodegaForm mode='edit' /></RequireAuth>} />

          <Route path="/inventarios/existencias" element={<RequireAuth><Existencias /></RequireAuth>} />
          <Route path="/inventarios/ajustes" element={<RequireAuth roles={["ADMINISTRADOR","SECRETARIA"]}><Ajustes /></RequireAuth>} />
          <Route path="/inventarios/movimientos" element={<RequireAuth><Movimientos /></RequireAuth>} />

          <Route path="/caja" element={<RequireAuth roles={["ADMINISTRADOR","SECRETARIA"]}><CajaEstado /></RequireAuth>} />

          <Route path="/ventas" element={<RequireAuth><VentasListado /></RequireAuth>} />
          <Route path="/ventas/:id" element={<RequireAuth><VentaDetalle /></RequireAuth>} />

          <Route path="/facturacion" element={<RequireAuth roles={["ADMINISTRADOR","SECRETARIA"]}><FacturacionListado /></RequireAuth>} />

          <Route path="/cierres" element={<RequireAuth roles={["ADMINISTRADOR","SECRETARIA"]}><CierresListado /></RequireAuth>} />
          <Route path="/cierres/generar" element={<RequireAuth roles={["ADMINISTRADOR","SECRETARIA"]}><GenerarCierre /></RequireAuth>} />

          <Route path="/catalogos/categorias" element={<RequireAuth roles={["ADMINISTRADOR","SECRETARIA"]}><Categorias /></RequireAuth>} />
          <Route path="/catalogos/marcas" element={<RequireAuth roles={["ADMINISTRADOR","SECRETARIA"]}><Marcas /></RequireAuth>} />
          <Route path="/catalogos/asignacion" element={<RequireAuth roles={["ADMINISTRADOR","SECRETARIA"]}><Asignacion /></RequireAuth>} />

          <Route path="/usuarios" element={<RequireAuth roles={["ADMINISTRADOR"]}><UsuariosListado /></RequireAuth>} />
          <Route path="/usuarios/nuevo" element={<RequireAuth roles={["ADMINISTRADOR"]}><UsuarioForm /></RequireAuth>} />
          <Route path="/usuarios/:id" element={<RequireAuth roles={["ADMINISTRADOR"]}><UsuarioForm /></RequireAuth>} />
          <Route path="/proveedores" element={<RequireAuth roles={["ADMINISTRADOR"]}><ProveedoresList /></RequireAuth>} />
          <Route path="/proveedores/nuevo" element={<RequireAuth roles={["ADMINISTRADOR"]}><ProveedorForm /></RequireAuth>} />
          <Route path="/compras/nueva" element={<RequireAuth roles={["ADMINISTRADOR"]}><RegistroCompra /></RequireAuth>} />

          <Route path="/perfil" element={<RequireAuth><Perfil /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
    </ToastProvider>
    </QueryClientProvider>
  )
}
