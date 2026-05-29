import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Card, CardHeader } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../auth/AuthContext'
import { ProductoPickerModal } from '../../components/ui/ProductoPickerModal'
import { QuickCreateClienteModal } from '../../components/ui/QuickCreateClienteModal'
import { QuickCreateVehiculoModal } from '../../components/ui/QuickCreateVehiculoModal'
import { Combobox } from '../../components/ui/Combobox'

type Cliente = { id: string; nombre: string }
type Vehiculo = { id: string; placa: string; linea?: string }
type Producto = {
  id: string
  descripcion: string
  precioA: string
  stockPorBodega: { bodegaId: string; nombreBodega: string; cantidad: number }[]
}
type LineaProducto = {
  producto: Producto
  bodega: { id: string; nombre: string }
  cantidad: number
  precioUnitario: number
}
type LineaServicio = { descripcion?: string; costo?: number; precio?: number }

function generarNumero() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `ORD-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

const CLIENTE_CF: Cliente = { id: 'CF', nombre: 'Consumidor Final' }

export function OrdenNueva() {
  const nav = useNavigate()
  const { usuario } = useAuth()
  const toast = useToast()

  const [numero, setNumero] = useState(generarNumero())
  const [clienteId, setClienteId] = useState<string>(CLIENTE_CF.id)
  const [clienteQuery, setClienteQuery] = useState<string>(CLIENTE_CF.nombre)
  const [vehiculoId, setVehiculoId] = useState<string>('')
  const [vehiculoQuery, setVehiculoQuery] = useState<string>('')
  const [observaciones, setObservaciones] = useState('')

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])

  const [lineasProd, setLineasProd] = useState<LineaProducto[]>([])
  const [lineasServ, setLineasServ] = useState<LineaServicio[]>([])

  const [loading, setLoading] = useState(true)
  const [isPickerOpen, setPickerOpen] = useState(false)
  const [isQuickClienteOpen, setQuickClienteOpen] = useState(false)
  const [isQuickVehiculoOpen, setQuickVehiculoOpen] = useState(false)

  // Cargar clientes y alinear el query visible
  useEffect(() => {
    api.client
      .get('/clientes')
      .then((res) => {
        const lista = [CLIENTE_CF, ...res.data]
        setClientes(lista)
        const actual = lista.find((c) => c.id === clienteId)
        setClienteQuery(actual ? actual.nombre : CLIENTE_CF.nombre)
      })
      .catch(() => toast.error('Error cargando clientes'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cargar vehículos según cliente
  useEffect(() => {
    if (clienteId && clienteId !== CLIENTE_CF.id) {
      api.client
        .get('/vehiculos', { params: { clienteId } })
        .then((res) => {
          setVehiculos(res.data)
          setVehiculoQuery('')
        })
        .catch(() => toast.error('Error cargando vehículos'))
    } else {
      setVehiculos([])
      setVehiculoQuery('')
    }
    setVehiculoId('')
  }, [clienteId, toast])

  const handleSelectProducto = (producto: Producto, bodega: { id: string; nombre: string }) => {
    const existingLineIndex = lineasProd.findIndex(
      (l) => l.producto.id === producto.id && l.bodega.id === bodega.id,
    )
    const stock = producto.stockPorBodega.find((s) => s.bodegaId === bodega.id)?.cantidad || 0

    if (existingLineIndex > -1) {
      const updatedLineas = [...lineasProd]
      const currentQty = updatedLineas[existingLineIndex].cantidad
      if (currentQty + 1 > stock) {
        toast.warning('No hay suficiente stock para agregar más de este producto.')
        return
      }
      updatedLineas[existingLineIndex].cantidad += 1
      setLineasProd(updatedLineas)
    } else {
      if (1 > stock) {
        toast.warning('No hay stock disponible para este producto en la bodega seleccionada.')
        return
      }
      const newLinea: LineaProducto = {
        producto,
        bodega,
        cantidad: 1,
        precioUnitario: Number(producto.precioA),
      }
      setLineasProd((prev) => [...prev, newLinea])
    }
  }

  const updateLineaProd = (index: number, newQty: number) => {
    const linea = lineasProd[index]
    const stock = linea.producto.stockPorBodega.find((s) => s.bodegaId === linea.bodega.id)?.cantidad || 0
    if (newQty > stock) {
      toast.warning(`Stock máximo: ${stock}`)
      return
    }
    if (newQty < 1) {
      onRemoveLineaProd(index)
      return
    }
    const updatedLineas = [...lineasProd]
    updatedLineas[index].cantidad = newQty
    setLineasProd(updatedLineas)
  }

  const onRemoveLineaProd = (idx: number) => setLineasProd((prev) => prev.filter((_, i) => i !== idx))
  const onAddLineaServ = () => setLineasServ((prev) => [...prev, { descripcion: '', precio: 0, costo: 0 }])
  const onRemoveLineaServ = (idx: number) => setLineasServ((prev) => prev.filter((_, i) => i !== idx))
  const onChangeLineaServ = (idx: number, patch: Partial<LineaServicio>) =>
    setLineasServ((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))

  const totalProductos = useMemo(
    () => lineasProd.reduce((acc, l) => acc + l.precioUnitario * l.cantidad, 0),
    [lineasProd],
  )
  const totalServicios = useMemo(
    () => lineasServ.reduce((acc, l) => acc + (l.precio || 0), 0),
    [lineasServ],
  )
  const total = totalProductos + totalServicios

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuario?.id) {
      toast.error('Sesión inválida')
      return
    }
    if (lineasProd.length === 0 && lineasServ.length === 0) {
      toast.error('Agrega al menos un producto o servicio')
      return
    }

    try {
      const payload: any = {
        numero,
        clienteId: clienteId === CLIENTE_CF.id ? null : clienteId,
        vehiculoId: vehiculoId || null,
        usuarioId: usuario.id,
        observaciones,
        productos: lineasProd.map((l) => ({
          productoId: l.producto.id,
          bodegaId: l.bodega.id,
          cantidad: String(l.cantidad),
          costoUnitario: String(0),
          precioUnitario: String(l.precioUnitario),
        })),
        servicios: lineasServ.map((l) => ({ descripcion: l.descripcion || '', costo: String(0), precio: String(l.precio ?? 0) })),
      }
      await api.client.post('/ordenes', payload)
      toast.success('Orden creada')
      nav('/ordenes')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error creando la orden')
    }
  }

  if (loading)
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Spinner /> Cargando datos...
      </div>
    )

  return (
    <>
      <div className="space-y-4 max-w-4xl">
        <Card>
          <CardHeader title="Nueva Orden de Servicio" />
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Número</label>
                <input className="input" value={numero} onChange={(e) => setNumero(e.target.value)} required />
              </div>
              <div>
                <Combobox<any>
                  label="Cliente"
                  options={clientes}
                  value={clienteQuery}
                  onChange={(val) => {
                    setClienteQuery(val)
                    const found = clientes.find((c) => c.nombre.toLowerCase() === val.toLowerCase())
                    setClienteId(found?.id || CLIENTE_CF.id)
                  }}
                  displayValue={(c) => c.nombre}
                  valueKey={(c) => c.nombre}
                />
              </div>
              <div>
                <Combobox<any>
                  label="Vehículo"
                  options={vehiculos}
                  value={vehiculoQuery}
                  onChange={(val) => {
                    setVehiculoQuery(val)
                    const found = vehiculos.find(
                      (v) => `${v.placa}${v.linea ? ' ' + v.linea : ''}`.toLowerCase() === val.toLowerCase(),
                    )
                    setVehiculoId(found?.id || '')
                  }}
                  displayValue={(v) => `${v.placa}${v.linea ? ' ' + v.linea : ''}`}
                  valueKey={(v) => `${v.placa}${v.linea ? ' ' + v.linea : ''}`}
                  disabled={!clienteId || clienteId === CLIENTE_CF.id}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setQuickClienteOpen(true)}
              >
                + Crear cliente
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!clienteId || clienteId === CLIENTE_CF.id}
                onClick={() => setQuickVehiculoOpen(true)}
              >
                + Crear vehículo
              </button>
            </div>

            <div>
              <label className="label">Observaciones</label>
              <input className="input" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Productos</h3>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPickerOpen(true)}
                >
                  Buscar producto
                </button>
              </div>
              {lineasProd.map((l, idx) => (
                <div key={idx} className="grid grid-cols-6 gap-3 items-center">
                  <div className="col-span-2">
                    <p className="font-medium">{l.producto.descripcion}</p>
                    <p className="text-xs text-gray-500">Bodega: {l.bodega.nombre}</p>
                  </div>
                  <input
                    className="input"
                    type="number"
                    value={l.cantidad}
                    onChange={(e) => updateLineaProd(idx, Number(e.target.value))}
                  />
                  <p className="text-sm text-right">Q {l.precioUnitario.toFixed(2)}</p>
                  <p className="text-sm font-semibold text-right">Q {(l.cantidad * l.precioUnitario).toFixed(2)}</p>
                  <button type="button" className="btn btn-ghost" onClick={() => onRemoveLineaProd(idx)}>
                    Quitar
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Servicios</h3>
                <button type="button" className="btn btn-secondary" onClick={onAddLineaServ}>
                  Agregar servicio
                </button>
              </div>
              {lineasServ.map((l, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-3">
                  <input
                    className="input col-span-2"
                    placeholder="Descripción"
                    value={l.descripcion || ''}
                    onChange={(e) => onChangeLineaServ(idx, { descripcion: e.target.value })}
                  />
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    placeholder="Precio"
                    value={l.precio ?? ''}
                    onChange={(e) =>
                      onChangeLineaServ(idx, {
                        precio: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                  <p className="input bg-gray-50 flex items-center justify-between font-medium">
                    Q {Number(l.precio || 0).toFixed(2)}
                  </p>
                  <button type="button" className="btn btn-ghost" onClick={() => onRemoveLineaServ(idx)}>
                    Quitar
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-6 text-sm">
              <div className="text-gray-600">
                Total productos: <span className="font-medium">Q {totalProductos.toFixed(2)}</span>
              </div>
              <div className="text-gray-600">
                Total servicios: <span className="font-medium">Q {totalServicios.toFixed(2)}</span>
              </div>
              <div className="text-gray-900">
                Total: <span className="font-semibold">Q {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn btn-primary" type="submit">
                Crear orden
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => nav('/ordenes')}>
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      </div>
      {isPickerOpen && (
        <ProductoPickerModal onClose={() => setPickerOpen(false)} onSelect={handleSelectProducto} />
      )}
      {isQuickClienteOpen && (
        <QuickCreateClienteModal
          open={isQuickClienteOpen}
          onClose={() => setQuickClienteOpen(false)}
          onCreated={(nuevo) => {
            const lista = [CLIENTE_CF, ...clientes, nuevo]
            setClientes(lista)
            setClienteId(nuevo.id)
            setClienteQuery(nuevo.nombre)
          }}
        />
      )}
      {isQuickVehiculoOpen && clienteId && clienteId !== CLIENTE_CF.id && (
        <QuickCreateVehiculoModal
          open={isQuickVehiculoOpen}
          onClose={() => setQuickVehiculoOpen(false)}
          clienteId={clienteId}
          onCreated={(nuevo) => {
            const lista = [...vehiculos, nuevo]
            setVehiculos(lista)
            setVehiculoId(nuevo.id)
            setVehiculoQuery(`${nuevo.placa}${nuevo.linea ? ' ' + nuevo.linea : ''}`)
          }}
        />
      )}
    </>
  )
}




