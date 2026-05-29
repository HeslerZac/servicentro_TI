import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, ModalHeader } from './Modal'
import { useClientes } from '../../hooks/useClientes'
import { useToast } from './Toast'

const schema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  nit: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function QuickCreateClienteModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (cliente: any) => void }) {
  const { create } = useClientes()
  const toast = useToast()
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      const nuevo = await create.mutateAsync({
        nombre: data.nombre,
        nit: data.nit || 'CF',
        telefono: data.telefono,
        direccion: data.direccion,
      })
      toast.success('Cliente creado')
      reset()
      onCreated(nuevo)
      onClose()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error creando cliente')
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title="Crear cliente" onClose={onClose} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="label">Nombre</label>
          <input className="input" {...register('nombre')} />
          {errors.nombre && <p className="text-sm text-red-600">{errors.nombre.message}</p>}
        </div>
        <div>
          <label className="label">NIT</label>
          <input className="input" placeholder="CF" {...register('nit')} />
        </div>
        <div>
          <label className="label">Teléfono</label>
          <input className="input" {...register('telefono')} />
        </div>
        <div>
          <label className="label">Dirección</label>
          <input className="input" {...register('direccion')} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn" disabled={isSubmitting}>Crear</button>
        </div>
      </form>
    </Modal>
  )
}

