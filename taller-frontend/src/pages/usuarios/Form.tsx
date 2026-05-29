import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader } from '../../components/ui/Card'
import { useUsuarios } from '../../hooks/useUsuarios'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { RequireRole } from '../../auth/RequireRole'

const createSchema = z.object({
  nombreUsuario: z.string().min(3),
  nombre: z.string().min(1),
  telefono: z.string().min(1),
  direccion: z.string().min(1),
  contrasena: z.string().min(6),
  rol: z.enum(['ADMINISTRADOR','SECRETARIA','VENDEDOR'])
})

const editSchema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().min(1),
  direccion: z.string().min(1),
})

export default function UsuarioForm() {
  const { id } = useParams()
  const isEdit = !!id
  const schema = isEdit ? editSchema : createSchema
  const { create, get, update } = useUsuarios() as any
  const nav = useNavigate()
  const toast = useToast()
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<any>({ resolver: zodResolver(schema as any) })

  if (isEdit && get) {
    get(id!).then((r: any) => {
      const u = r.data
      setValue('nombre', u.nombre || '')
      setValue('telefono', u.telefono || '')
      setValue('direccion', u.direccion || '')
    }).catch(() => {})
  }

  const onSubmit = async (data: any) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: id!, dto: { nombre: data.nombre, telefono: data.telefono, direccion: data.direccion } })
        toast.success('Usuario actualizado')
      } else {
        await create.mutateAsync(data)
        toast.success('Usuario creado')
      }
      nav('/usuarios')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error')
    }
  }

  return (
    <RequireRole roles={["ADMINISTRADOR"]}>
      <div className="max-w-xl">
        <Card>
          <CardHeader title={isEdit ? 'Editar Usuario' : 'Nuevo Usuario'} />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!isEdit && (
              <div>
                <label className="label">Usuario</label>
                <input className="input" {...register('nombreUsuario')} />
                {errors.nombreUsuario && <div className="text-sm text-red-600">{String((errors as any).nombreUsuario?.message)}</div>}
              </div>
            )}
            <div>
              <label className="label">Nombre</label>
              <input className="input" {...register('nombre')} />
              {errors.nombre && <div className="text-sm text-red-600">{String((errors as any).nombre?.message)}</div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Teléfono</label>
                <input className="input" {...register('telefono')} />
                {errors.telefono && <div className="text-sm text-red-600">{String((errors as any).telefono?.message)}</div>}
              </div>
              <div>
                <label className="label">Dirección</label>
                <input className="input" {...register('direccion')} />
                {errors.direccion && <div className="text-sm text-red-600">{String((errors as any).direccion?.message)}</div>}
              </div>
            </div>
            {!isEdit && (
              <>
                <div>
                  <label className="label">Contraseña</label>
                  <input className="input" type="password" {...register('contrasena')} />
                  {errors.contrasena && <div className="text-sm text-red-600">{String((errors as any).contrasena?.message)}</div>}
                </div>
                <div>
                  <label className="label">Rol</label>
                  <select className="input" {...register('rol')}>
                    <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                    <option value="SECRETARIA">SECRETARIA</option>
                    <option value="VENDEDOR">VENDEDOR</option>
                  </select>
                </div>
              </>
            )}
            <div className="flex gap-2">
              <button className="btn" disabled={isSubmitting}>{isEdit ? 'Guardar' : 'Crear'}</button>
              <button className="btn btn-secondary" type="button" onClick={()=>nav('/usuarios')}>Cancelar</button>
            </div>
          </form>
        </Card>
      </div>
    </RequireRole>
  )
}

