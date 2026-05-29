import { Navigate, useLocation } from 'react-router-dom'
import { type RolUsuario, useAuth } from './AuthContext'

export function RequireAuth({ children, roles }: { children: React.ReactElement; roles?: RolUsuario[] }) {
  const { isAuthenticated, usuario } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && usuario && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }

  return children
}
