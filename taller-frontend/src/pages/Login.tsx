import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Card, CardHeader } from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'
import { Spinner } from '../components/ui/Spinner'

export function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const location = useLocation() as any
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [loading, setLoading] = useState(false)

  const toast = useToast()
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ usuario, contrasena })
      toast.success('¡Bienvenido!')
      const to = location.state?.from?.pathname || '/'
      nav(to, { replace: true })
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Credenciales inválidas'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader title="Iniciar sesión" subtitle="Ingresa tus credenciales para continuar" />
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Usuario</label>
              <input className="input" value={usuario} onChange={(e)=>setUsuario(e.target.value)} required />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input className="input" type="password" value={contrasena} onChange={(e)=>setContrasena(e.target.value)} required />
            </div>
            <div className="flex items-center gap-3">
              <button className="btn btn-primary" disabled={loading}>{loading? (<span className="inline-flex items-center gap-2"><Spinner /> Entrando...</span>) :'Entrar'}</button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
