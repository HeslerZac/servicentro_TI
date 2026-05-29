import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireRole({ roles, children }: { roles: Array<'ADMINISTRADOR'|'SECRETARIA'|'VENDEDOR'>; children: React.ReactElement }) {
  const { isAuthenticated, usuario } = useAuth()
  const loc = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: loc }} replace />
  if (!usuario || !roles.includes(usuario.rol)) return <Navigate to="/" replace />
  return children
}

