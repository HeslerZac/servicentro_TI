import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader } from '../../components/ui/Card'
import { useBodegas } from '../../hooks/useBodegas'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useToast } from '../../components/ui/Toast'

const schema = z.object({ codigo: z.string().min(1), nombre: z.string().min(1), ubicacion: z.string().optional() })
type FormData = z.infer<typeof schema>

export default function BodegaForm({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const { get, create, update } = useBodegas()
  const q = id ? get(id) : undefined
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (mode === 'edit' && q?.data) {
      setValue('codigo', q.data.codigo)
      setValue('nombre', q.data.nombre)
      setValue('ubicacion', q.data.ubicacion || '')
    }
  }, [mode, q?.data, setValue])

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'create') { await create.mutateAsync(data); toast.success('Bodega creada') }
      else if (id) { await update.mutateAsync({ id, dto: data }); toast.success('Bodega actualizada') }
      nav('/bodegas')
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Error guardando') }
  }

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader title={`${mode==='create'?'Nueva':'Editar'} bodega`} />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Código</label>
            <input className="input" {...register('codigo')} />
            {errors.codigo && <div className="text-sm text-red-600">{errors.codigo.message}</div>}
          </div>
          <div>
            <label className="label">Nombre</label>
            <input className="input" {...register('nombre')} />
            {errors.nombre && <div className="text-sm text-red-600">{errors.nombre.message}</div>}
          </div>
          <div>
            <label className="label">Ubicación</label>
            <input className="input" {...register('ubicacion')} />
          </div>
          <div className="flex gap-2">
            <button className="btn" disabled={isSubmitting}>Guardar</button>
            <button className="btn btn-secondary" type="button" onClick={()=>nav('/bodegas')}>Cancelar</button>
          </div>
        </form>
      </Card>
    </div>
  )
}

