import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useInventarios } from '../../hooks/useInventarios'
import { Card, CardHeader } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { usePeriodoCerrado } from '../../hooks/useCierresEstado'
import { useProductos } from '../../hooks/useProductos'
import { useBodegas } from '../../hooks/useBodegas'
import { Combobox } from '../../components/ui/Combobox'
import { useState } from 'react'
import { ProductoPickerModal } from '../../components/ui/ProductoPickerModal'

const schema = z.object({
  tipo: z.enum(['ENTRADA', 'SALIDA']),
  productoId: z.string().min(1, 'Debe seleccionar un producto'),
  bodegaId: z.string().min(1, 'Debe seleccionar una bodega'),
  cantidad: z.coerce.number().positive('La cantidad debe ser mayor a cero'),
  motivo: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function Ajustes() {
  const { ajustar } = useInventarios()
  const { isFechaCerrada } = usePeriodoCerrado()
  const { data: productosResp } = useProductos().list()
  const productos = (productosResp as any)?.items ?? []
  const { data: bodegas } = useBodegas().list()
  const { data: existencias } = useInventarios().existencias()

  const [productoQuery, setProductoQuery] = useState('')
  const [bodegaQuery, setBodegaQuery] = useState('')
  const [isPickerOpen, setPickerOpen] = useState(false)

  const bloqueado = isFechaCerrada(new Date().toISOString())
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({ resolver: zodResolver(schema) as any }) // HACK: Cast to any to bypass type inference issue
  const toast = useToast()

  const productoId = watch('productoId')
  const bodegaId = watch('bodegaId')

  const stockActual = existencias?.find(
    (e: any) => e.productoId === productoId && e.bodegaId === bodegaId
  )?.cantidad || 0

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await ajustar.mutateAsync(data)
      toast.success('Ajuste de inventario aplicado correctamente')
      reset()
      setProductoQuery('')
      setBodegaQuery('')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error ajustando inventario')
    }
  }

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader title="Ajuste de inventario" />
        <div className="flex justify-end">
          <button type="button" className="btn btn-secondary" onClick={() => setPickerOpen(true)}>Buscar producto</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Tipo de Ajuste</label>
            <select className="input" {...register('tipo')}>
              <option value="ENTRADA">ENTRADA (Aumentar stock)</option>
              <option value="SALIDA">SALIDA (Disminuir stock)</option>
            </select>
          </div>

          <Combobox<any>
            label="Producto"
            options={productos || []}
            value={productoQuery}
            onChange={(query) => {
              setProductoQuery(query)
              const selected = productos?.find((p: any) => p.descripcion.toLowerCase() === query.toLowerCase())
              setValue('productoId', selected?.id || '')
            }}
            displayValue={(p) => p.descripcion}
            valueKey={(p) => p.descripcion}
            error={errors.productoId?.message}
          />

          <Combobox<any>
            label="Bodega"
            options={bodegas || []}
            value={bodegaQuery}
            onChange={(query) => {
              setBodegaQuery(query)
              const selected = bodegas?.find((b: any) => b.nombre.toLowerCase() === query.toLowerCase())
              setValue('bodegaId', selected?.id || '')
            }}
            displayValue={(b) => b.nombre}
            valueKey={(b) => b.nombre}
            error={errors.bodegaId?.message}
          />

          {productoId && bodegaId && (
            <div className="text-sm text-gray-600">
              Stock actual: <span className="font-semibold">{stockActual}</span>
            </div>
          )}

          <div>
            <label className="label">Cantidad</label>
            <input className="input" type="number" step="0.01" {...register('cantidad')} />
            {errors.cantidad && <div className="text-sm text-red-600">{errors.cantidad.message}</div>}
          </div>

          <div>
            <label className="label">Motivo del ajuste</label>
            <input className="input" {...register('motivo')} />
          </div>

          {bloqueado && (
            <div className="text-sm text-red-600">
              Bloqueado por período cerrado. No es posible registrar ajustes en este rango.
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="btn"
              disabled={isSubmitting || bloqueado}
              title={bloqueado ? 'Bloqueado por período cerrado' : undefined}
            >
              Aplicar Ajuste
            </button>
          </div>
        </form>
      </Card>
      {isPickerOpen && (
        <ProductoPickerModal
          onClose={() => setPickerOpen(false)}
          onSelect={(producto: any, bodega: any) => {
            setPickerOpen(false)
            setProductoQuery(producto.descripcion)
            setBodegaQuery(bodega.nombre)
            setValue('productoId', producto.id)
            setValue('bodegaId', bodega.id)
          }}
        />
      )}
    </div>
  )
}
