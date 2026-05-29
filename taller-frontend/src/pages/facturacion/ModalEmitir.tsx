import { Modal, ModalHeader } from '../../components/ui/Modal'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({ numero: z.string().optional(), razonSocial: z.string().min(1), nit: z.string().min(1), direccion: z.string().min(1), formaPago: z.string().optional() })
type FormData = z.infer<typeof schema>

export function ModalEmitir({ open, onClose, onSubmit, defaults }: { open: boolean; onClose: () => void; onSubmit: (data: FormData) => Promise<void>; defaults?: Partial<FormData> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: defaults })
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title="Emitir factura" onClose={onClose} />
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="label">Número (opcional)</label>
          <input className="input" {...register('numero')} />
        </div>
        <div>
          <label className="label">Razón Social</label>
          <input className="input" {...register('razonSocial')} />
          {errors.razonSocial && <div className="text-sm text-red-600">{errors.razonSocial.message}</div>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">NIT</label>
            <input className="input" {...register('nit')} />
            {errors.nit && <div className="text-sm text-red-600">{errors.nit.message}</div>}
          </div>
          <div>
            <label className="label">Forma de pago</label>
            <input className="input" placeholder="EFECTIVO/TARJETA/TRANSFERENCIA" {...register('formaPago')} />
          </div>
        </div>
        <div>
          <label className="label">Dirección</label>
          <input className="input" {...register('direccion')} />
          {errors.direccion && <div className="text-sm text-red-600">{errors.direccion.message}</div>}
        </div>
        <div className="flex gap-2">
          <button className="btn" disabled={isSubmitting}>Emitir</button>
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </Modal>
  )
}

