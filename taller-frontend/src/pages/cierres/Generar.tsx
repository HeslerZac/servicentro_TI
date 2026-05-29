import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCierres } from '../../hooks/useCierres'
import { Card, CardHeader } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'

const schema = z.object({ desde: z.string().min(1), hasta: z.string().min(1) })
type FormData = z.infer<typeof schema>

export default function GenerarCierre() {
  const { generar } = useCierres()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const toast = useToast()
  const onSubmit = async (data: FormData) => {
    try { await generar.mutateAsync(data); toast.success('Cierre generado') } catch (e: any) { toast.error(e?.response?.data?.message || 'Error generando cierre') }
  }
  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader title="Generar Cierre" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">Desde</label>
              <input className="input" type="date" {...register('desde')} />
              {errors.desde && <div className="text-sm text-red-600">{errors.desde.message}</div>}
            </div>
            <div>
              <label className="label">Hasta</label>
              <input className="input" type="date" {...register('hasta')} />
              {errors.hasta && <div className="text-sm text-red-600">{errors.hasta.message}</div>}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn" disabled={isSubmitting}>Generar</button>
          </div>
        </form>
      </Card>
    </div>
  )
}

