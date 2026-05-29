import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, ModalHeader } from './Modal'
import { useVehiculos } from '../../hooks/useVehiculos'
import { useToast } from './Toast'

const schema = z.object({
  clienteId: z.string().min(1, 'Cliente es requerido'),
  placa: z.string().min(3, 'Placa inválida'),
  linea: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function QuickCreateVehiculoModal({ open, onClose, clienteId, onCreated }: { open: boolean; onClose: () => void; clienteId: string; onCreated: (vehiculo: any) => void }) {
  const { create } = useVehiculos()
  const toast = useToast()
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { clienteId } })

  const onSubmit = async (data: FormData) => {
    try {
      const nuevo = await create.mutateAsync({
        clienteId: data.clienteId,
        placa: data.placa,
        linea: data.linea,
      })
      toast.success('Vehículo creado')
      reset({ clienteId })
      onCreated(nuevo)
      onClose()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error creando vehículo')
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title="Crear vehículo" onClose={onClose} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="label">Cliente</label>
          <input className="input" value={clienteId} readOnly {...register('clienteId')} />
          {errors.clienteId && <p className="text-sm text-red-600">{errors.clienteId.message}</p>}
        </div>
        <div>
          <label className="label">Placa</label>
          <input className="input" {...register('placa')} />
          {errors.placa && <p className="text-sm text-red-600">{errors.placa.message}</p>}
        </div>
        <div>
          <label className="label">Línea/Modelo</label>
          <input className="input" {...register('linea')} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn" disabled={isSubmitting}>Crear</button>
        </div>
      </form>
    </Modal>
  )
}

