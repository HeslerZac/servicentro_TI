import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function Layout() {
  const { isAuthenticated, usuario, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold">Servicentro</Link>
          <nav className="flex items-center gap-4 text-sm">
            {isAuthenticated && (
              <>
                <NavLink to="/" className={({isActive})=>isActive? 'font-medium':'text-gray-600'}>Dashboard</NavLink>
                <NavLink to="/productos" className={({isActive})=>isActive? 'font-medium':'text-gray-600'}>Productos</NavLink>
                {usuario?.rol === 'ADMINISTRADOR' && (
                  <NavLink to="/registro" className={({isActive})=>isActive? 'font-medium':'text-gray-600'}>Registro</NavLink>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">{(usuario as any)?.nombre || usuario?.nombreUsuario} ({usuario?.rol})</span>
                <button className="btn btn-secondary" onClick={logout}>Salir</button>
              </>
            ) : (
              <NavLink to="/login" className="btn">Entrar</NavLink>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

