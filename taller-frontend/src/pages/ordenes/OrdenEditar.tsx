import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/api'
import { Card, CardHeader } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../auth/AuthContext'

type Cliente = { id: string; nombre: string }
type Vehiculo = { id: string; placa: string; linea?: string }
type Producto = { id: string; descripcion: string; precioA: string; precioB: string; precioMayorista: string; costo?: string }
type Bodega = { id: string; nombre: string; codigo: string }

type LineaProducto = { id?: string; productoId?: string; bodegaId?: string; cantidad?: number }
type LineaServicio = { id?: string; descripcion?: string; costo?: number; precio?: number }

export function OrdenEditar() {
  const { id } = useParams()
  const nav = useNavigate()
  useAuth() // ensure protected; no direct usage needed here
  const toast = useToast()

  const [numero, setNumero] = useState('')
  const [clienteId, setClienteId] = useState<string>('')
  const [vehiculoId, setVehiculoId] = useState<string>('')
  const [observaciones, setObservaciones] = useState('')

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [bodegas, setBodegas] = useState<Bodega[]>([])

  const [lineasProd, setLineasProd] = useState<LineaProducto[]>([])
  const [lineasServ, setLineasServ] = useState<LineaServicio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [ord, c, prd, bod] = await Promise.all([
          api.client.get(`/ordenes/${id}`),
          api.client.get('/clientes'),
          api.client.get('/productos'),
          api.client.get('/bodegas'),
        ])
        if (!mounted) return
        const o = ord.data
        setNumero(o.numero)
        setClienteId(o.cliente?.id || '')
        setVehiculoId(o.vehiculo?.id || '')
        setObservaciones(o.observaciones || '')
        setClientes(c.data)
        setProductos(prd.data)
        setBodegas(bod.data)
        setLineasProd((o.detallesProducto || []).map((d: any) => ({ id: d.id, productoId: d.producto?.id, bodegaId: d.bodega?.id, cantidad: Number(d.cantidad || 0) })))
        setLineasServ((o.detallesServicio || []).map((d: any) => ({ id: d.id, descripcion: d.descripcion, costo: Number(d.costo || 0), precio: Number(d.precio || 0) })))
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Error cargando orden')
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id, toast])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!clienteId) { setVehiculos([]); setVehiculoId(''); return }
      try {
        const { data } = await api.client.get('/vehiculos', { params: { clienteId } })
        if (!mounted) return
        setVehiculos(data)
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Error cargando vehículos')
      }
    })()
    return () => { mounted = false }
  }, [clienteId, toast])

  const onAddLineaProd = () => setLineasProd((prev) => [...prev, {}])
  const onRemoveLineaProd = (idx: number) => setLineasProd((prev) => prev.filter((_, i) => i !== idx))
  const onChangeLineaProd = (idx: number, patch: Partial<LineaProducto>) => setLineasProd((prev) => prev.map((l, i) => i === idx ? { ...l, ...patch } : l))

  const onAddLineaServ = () => setLineasServ((prev) => [...prev, {}])
  const onRemoveLineaServ = (idx: number) => setLineasServ((prev) => prev.filter((_, i) => i !== idx))
  const onChangeLineaServ = (idx: number, patch: Partial<LineaServicio>) => setLineasServ((prev) => prev.map((l, i) => i === idx ? { ...l, ...patch } : l))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validaciones básicas
      for (const [i, l] of lineasProd.entries()) {
        if (!l.productoId) { toast.error(`Selecciona producto en la línea ${i+1}`); return }
        if (!l.bodegaId) { toast.error(`Selecciona bodega en la línea ${i+1}`); return }
        if (!l.cantidad || l.cantidad <= 0) { toast.error(`Cantidad inválida en la línea ${i+1}`); return }
      }
      for (const [i, l] of lineasServ.entries()) {
        if (l.descripcion && (!l.precio || l.precio <= 0)) { toast.error(`Precio de servicio inválido en la línea ${i+1}`); return }
      }
      const productosPayload = lineasProd
        .filter(l => l.productoId && l.bodegaId && l.cantidad && l.cantidad > 0)
        .map(l => ({
          productoId: l.productoId!,
          bodegaId: l.bodegaId!,
          cantidad: (l.cantidad!).toFixed(3),
        }))

      const serviciosPayload = lineasServ
        .filter(l => l.descripcion && (l.precio || 0) >= 0)
        .map(l => ({
          descripcion: l.descripcion!,
          costo: Number(l.costo || 0).toFixed(2),
          precio: Number(l.precio || 0).toFixed(2),
        }))

      const payload: any = {
        numero,
        clienteId,
        vehiculoId: vehiculoId || undefined,
        observaciones: observaciones || undefined,
        productos: productosPayload,
        servicios: serviciosPayload,
      }

      await api.client.patch(`/ordenes/${id}`, payload)
      toast.success('Orden actualizada')
      nav(`/ordenes/${id}`)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error actualizando orden')
    }
  }

  if (loading) return <div className="flex items-center gap-2 text-sm text-gray-600"><Spinner /> Cargando...</div>

  return (
    <div className="space-y-4 max-w-4xl">
      <Card>
        <CardHeader title="Editar Orden" />
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Número</label>
              <input className="input" value={numero} onChange={(e)=>setNumero(e.target.value)} required />
            </div>
            <div>
              <label className="label">Cliente</label>
              <select className="input" value={clienteId} onChange={(e)=>setClienteId(e.target.value)} required>
                <option value="">Seleccione</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Vehículo</label>
              <select className="input" value={vehiculoId} onChange={(e)=>setVehiculoId(e.target.value)} disabled={!clienteId}>
                <option value="">Sin vehículo</option>
                {vehiculos.map(v => <option key={v.id} value={v.id}>{v.placa} {v.linea? `· ${v.linea}`:''}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Observaciones</label>
            <input className="input" value={observaciones} onChange={(e)=>setObservaciones(e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Productos</h3>
              <button type="button" className="btn btn-secondary" onClick={onAddLineaProd}>Agregar producto</button>
            </div>
            <div className="space-y-3">
              {lineasProd.map((l, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <select className="input" value={l.productoId || ''} onChange={(e)=>onChangeLineaProd(idx, { productoId: e.target.value })}>
                    <option value="">Producto</option>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.descripcion}</option>)}
                  </select>
                  <select className="input" value={l.bodegaId || ''} onChange={(e)=>onChangeLineaProd(idx, { bodegaId: e.target.value })}>
                    <option value="">Bodega</option>
                    {bodegas.map(b => <option key={b.id} value={b.id}>{b.codigo} · {b.nombre}</option>)}
                  </select>
                  <input className="input" type="number" step="0.001" min="0.001" placeholder="Cantidad" value={l.cantidad ?? ''} onChange={(e)=>onChangeLineaProd(idx, { cantidad: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  <div className="input bg-gray-50 flex items-center">—</div>
                  <div className="input bg-gray-50 flex items-center justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{l.cantidad ? `Q ${(Number(l.cantidad) * 1).toFixed(2)}` : 'Q 0.00'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="btn btn-ghost" onClick={()=>onRemoveLineaProd(idx)}>Quitar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Servicios</h3>
              <button type="button" className="btn btn-secondary" onClick={onAddLineaServ}>Agregar servicio</button>
            </div>
            <div className="space-y-3">
              {lineasServ.map((l, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <input className="input" placeholder="Descripción" value={l.descripcion || ''} onChange={(e)=>onChangeLineaServ(idx, { descripcion: e.target.value })} />
                  <input className="input" type="number" step="0.01" placeholder="Costo" value={l.costo ?? ''} onChange={(e)=>onChangeLineaServ(idx, { costo: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  <input className="input" type="number" step="0.01" placeholder="Precio" value={l.precio ?? ''} onChange={(e)=>onChangeLineaServ(idx, { precio: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  <div className="input bg-gray-50 flex items-center justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">Q {Number(l.precio || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="btn btn-ghost" onClick={()=>onRemoveLineaServ(idx)}>Quitar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn btn-primary" type="submit">Guardar cambios</button>
            <button className="btn btn-secondary" type="button" onClick={()=>nav(`/ordenes/${id}`)}>Cancelar</button>
          </div>
        </form>
      </Card>
    </div>
  )
}
