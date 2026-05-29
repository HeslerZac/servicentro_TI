import { useState } from 'react'
import { useAuth, type RolUsuario } from '../auth/AuthContext'
import { Card, CardHeader } from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'
import { Spinner } from '../components/ui/Spinner'

export function Register() {
  const { register } = useAuth()
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [rol, setRol] = useState<RolUsuario>('SECRETARIA')
  const [loading, setLoading] = useState(false)

  const toast = useToast()
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register({ nombreUsuario, contrasena, rol })
      toast.success('Usuario creado correctamente')
      setNombreUsuario('')
      setContrasena('')
      setRol('SECRETARIA')
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Error creando usuario'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader title="Registrar usuario" subtitle="Solo para administradores" />
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Nombre de usuario</label>
              <input className="input" value={nombreUsuario} onChange={(e)=>setNombreUsuario(e.target.value)} required />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input className="input" type="password" value={contrasena} onChange={(e)=>setContrasena(e.target.value)} required />
            </div>
            <div>
              <label className="label">Rol</label>
              <select className="input" value={rol} onChange={(e)=>setRol(e.target.value as RolUsuario)}>
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="SECRETARIA">SECRETARIA</option>
                <option value="VENDEDOR">VENDEDOR</option>
              </select>
            </div>
            <div>
              <button className="btn btn-primary" disabled={loading}>{loading? (<span className="inline-flex items-center gap-2"><Spinner /> Guardando...</span>) :'Crear'}</button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
