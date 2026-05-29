import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../services/api'
import { useQueryClient } from '@tanstack/react-query'
import { useCaja } from '../../hooks/useCaja'

type Orden = {
  id: string
  numero: string
  estado: 'EN_CURSO'|'FINALIZADA'|'CANCELADA'
  cliente?: { id: string; nombre: string; nit?: string; direccion?: string }
  totalProductos: string
  totalServicios: string
  total: string
  venta?: { id: string }
}

export function Cobro() {
  const { id } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const [orden, setOrden] = useState<Orden | null>(null)
  const [loading, setLoading] = useState(true)
  const [metodo, setMetodo] = useState('EFECTIVO')
  const [recibido, setRecibido] = useState<number | ''>('')
  const [emitirFactura, setEmitirFactura] = useState(false)
  const [facturacion, setFacturacion] = useState({
    numero: '',
    razonSocial: '',
    nit: 'CF',
    direccion: '',
    formaPago: '',
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await api.client.get(`/ordenes/${id}`)
        if (!mounted) return
        setOrden(data)
        setFacturacion((f) => ({ ...f, razonSocial: data.cliente?.nombre || '', nit: (data.cliente as any)?.nit || 'CF', direccion: (data.cliente as any)?.direccion || '' }))
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Error cargando orden')
      } finally { setLoading(false) }
    })()
    return () => { mounted = false }
  }, [id, toast])

  const total = useMemo(() => Number(orden?.total || 0), [orden])
  const cambio = useMemo(() => typeof recibido === 'number' ? Math.max(0, recibido - total) : 0, [recibido, total])

  const qc = useQueryClient()
  const { getSesionActual, abrir } = useCaja()
  const sesionQuery = getSesionActual()
  const [saldoInicialCaja, setSaldoInicialCaja] = useState('0.00')
  const onCobrar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!orden) return
      if (!sesionQuery.data) {
        toast.error('Caja cerrada. Abre caja antes de cobrar.')
        return
      }
      if (metodo === 'EFECTIVO') {
        if (typeof recibido !== 'number' || isNaN(recibido)) {
          toast.error('Ingresa el monto recibido en efectivo.')
          return
        }
        if (recibido < total) {
          toast.error('El recibido en efectivo no puede ser menor al total.')
          return
        }
      }
      setLoading(true)
      const payload: any = {
        formaPago: metodo,
        recibido: typeof recibido === 'number' ? recibido.toFixed(2) : undefined,
        cambio: typeof recibido === 'number' ? Math.max(0, recibido - total).toFixed(2) : undefined,
      }
      const { data: ordenFinal } = await api.client.post(`/ordenes/${orden.id}/cobrar`, payload)
      toast.success('Orden cobrada')
      qc.invalidateQueries({ queryKey: ['ordenes'] }); qc.invalidateQueries({ queryKey: ['ventas'] })
      if (emitirFactura && ordenFinal.venta?.id) {
        const dto = {
          ventaId: ordenFinal.venta.id,
          numero: facturacion.numero || generarNumeroFactura(),
          razonSocial: facturacion.razonSocial || 'CF',
          nit: facturacion.nit || 'CF',
          direccion: facturacion.direccion || '-',
          fecha: new Date().toISOString(),
          formaPago: facturacion.formaPago || metodo,
        }
        await api.client.post('/facturacion', dto)
        toast.success('Factura emitida')
        qc.invalidateQueries({ queryKey: ['facturacion'] })
      }
      if (ordenFinal.venta?.id) {
        toast.info('Venta creada. Navegando al detalle...')
        nav(`/ventas/${ordenFinal.venta.id}`)
      } else { nav(`/ordenes/${orden.id}`) }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'No se pudo cobrar')
    } finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center gap-2 text-sm text-gray-600"><Spinner /> Cargando...</div>
  if (!orden) return <div>No encontrada</div>

  // Si ya existe venta, atajos a venta/recibo
  if (orden.venta?.id) {
    return (
      <div className="max-w-2xl">
        <Card>
          <CardHeader title={`Orden ${orden.numero}`} />
          <div className="p-4 text-sm text-gray-700">Esta orden ya está cobrada.</div>
          <div className="p-4 flex gap-2">
            <button className="btn" onClick={()=>nav(`/ventas/${orden.venta!.id}`)}>Ver venta</button>
            <button className="btn btn-secondary" onClick={()=>nav(`/ventas/${orden.venta!.id}/recibo`)}>Imprimir comprobante</button>
            <button className="btn btn-secondary" onClick={()=>nav(`/ordenes/${orden.id}`)}>Volver</button>
          </div>
        </Card>
      </div>
    )
  }

  // Permitir cobrar tanto EN_CURSO como FINALIZADA (sin venta)
  // Si caja cerrada, pedir apertura primero
  if (sesionQuery.isSuccess && !sesionQuery.data) {
    return (
      <div className="max-w-md">
        <Card>
          <CardHeader title={`Caja cerrada`} />
          <div className="p-4 space-y-3">
            <div className="text-sm text-gray-700">Para cobrar la orden {orden.numero}, primero abre la caja.</div>
            <div>
              <label className="label">Saldo inicial (efectivo)</label>
              <input className="input" type="number" step="0.01" value={saldoInicialCaja} onChange={(e)=>setSaldoInicialCaja(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={async()=>{
                try {
                  await abrir.mutateAsync({ saldoInicialEfectivo: (Number(saldoInicialCaja||0)).toFixed(2) })
                  toast.success('Caja abierta')
                  sesionQuery.refetch()
                } catch(e:any){ toast.error(e?.response?.data?.message || 'No se pudo abrir caja') }
              }}>Abrir caja</button>
              <button className="btn btn-secondary" onClick={()=>window.history.back()}>Cancelar</button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader title={`Cobro de Orden ${orden.numero}`} />
        <form className="space-y-4" onSubmit={onCobrar}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Método de pago</label>
              <select className="input" value={metodo} onChange={(e)=>setMetodo(e.target.value)}>
                <option>EFECTIVO</option>
                <option>TARJETA</option>
                <option>TRANSFERENCIA</option>
              </select>
            </div>
            <div>
              <label className="label">Monto recibido (solo efectivo)</label>
              <input className="input" type="number" step="0.01" value={recibido} onChange={(e)=>setRecibido(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Opcional" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="card">
              <div className="text-gray-500">Productos</div>
              <div className="text-lg font-semibold">Q {Number(orden.totalProductos || 0).toFixed(2)}</div>
            </div>
            <div className="card">
              <div className="text-gray-500">Servicios</div>
              <div className="text-lg font-semibold">Q {Number(orden.totalServicios || 0).toFixed(2)}</div>
            </div>
            <div className="card">
              <div className="text-gray-500">Total</div>
              <div className="text-lg font-semibold">Q {total.toFixed(2)}</div>
              {typeof recibido === 'number' && <div className="text-xs text-gray-600 mt-1">Cambio: Q {cambio.toFixed(2)}</div>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={emitirFactura} onChange={(e)=>setEmitirFactura(e.target.checked)} />
              Emitir factura al finalizar
            </label>
            {emitirFactura && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label">Número de factura</label>
                  <input className="input" value={facturacion.numero} onChange={(e)=>setFacturacion(s=>({ ...s, numero: e.target.value }))} placeholder="Auto si vacío" />
                </div>
                <div>
                  <label className="label">Forma de pago</label>
                  <input className="input" value={facturacion.formaPago} onChange={(e)=>setFacturacion(s=>({ ...s, formaPago: e.target.value }))} placeholder={metodo} />
                </div>
                <div>
                  <label className="label">Razón Social</label>
                  <input className="input" value={facturacion.razonSocial} onChange={(e)=>setFacturacion(s=>({ ...s, razonSocial: e.target.value }))} />
                </div>
                <div>
                  <label className="label">NIT</label>
                  <input className="input" value={facturacion.nit} onChange={(e)=>setFacturacion(s=>({ ...s, nit: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Dirección</label>
                  <input className="input" value={facturacion.direccion} onChange={(e)=>setFacturacion(s=>({ ...s, direccion: e.target.value }))} />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button className="btn" type="submit">Cobrar</button>
            <button className="btn btn-secondary" type="button" onClick={()=>nav(`/ordenes/${orden.id}`)}>Cancelar</button>
          </div>
        </form>
      </Card>
    </div>
  )
}

function generarNumeroFactura() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `F-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}
