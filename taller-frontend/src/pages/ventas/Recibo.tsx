import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/api'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'

type Detalle = {
  descripcion?: string
  cantidad: string
  precioUnitario: string
  subtotal: string
  producto?: { descripcion: string }
}

type Venta = {
  id: string
  numero: string
  creadaEn: string
  total: string
  formaPago?: string
  recibido?: string | null
  cambio?: string | null
  cliente?: { nombre: string; nit?: string; direccion?: string }
  usuario?: { nombreUsuario: string }
  orden?: { numero: string }
  detalles: Detalle[]
}

export function Recibo() {
  const { id } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const [venta, setVenta] = useState<Venta | null>(null)
  const [loading, setLoading] = useState(true)
  const autoPrinted = useRef(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await api.client.get(`/ventas/${id}`)
        if (!mounted) return
        setVenta(data)
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Error cargando recibo')
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id, toast])

  useEffect(() => {
    if (!loading && venta && !autoPrinted.current) {
      autoPrinted.current = true
      setTimeout(() => window.print(), 300)
    }
  }, [loading, venta])

  if (loading) return <div className="flex items-center gap-2 text-sm text-gray-600 p-4"><Spinner /> Preparando recibo...</div>
  if (!venta) return <div className="p-4">Venta no encontrada</div>

  const fecha = new Date(venta.creadaEn)

  return (
    <div className="max-w-3xl mx-auto p-4 print:p-0">
      {/* Controles solo pantalla */}
      <div className="mb-4 flex items-center justify-between print:hidden">
        <div className="text-sm text-gray-600">Recibo listo para imprimir</div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => nav(-1)}>Volver</button>
          <button className="btn" onClick={() => window.print()}>Imprimir</button>
        </div>
      </div>

      {/* Hoja */}
      <div className="border rounded-lg bg-white p-6 shadow-sm print:shadow-none print:border-0">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">Servicentro</h1>
            <div className="text-sm text-gray-600">Recibo de Venta</div>
          </div>
          <div className="text-right text-sm">
            <div><span className="text-gray-500">Venta:</span> <span className="font-medium">{venta.numero}</span></div>
            <div><span className="text-gray-500">Fecha:</span> {fecha.toLocaleString()}</div>
            {venta.orden && <div><span className="text-gray-500">Orden:</span> {venta.orden.numero}</div>}
          </div>
        </header>

        <section className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="card">
            <div className="text-gray-500">Cliente</div>
            <div className="font-medium">{venta.cliente?.nombre || 'CF'}</div>
            <div className="text-gray-600">NIT: {venta.cliente?.nit || 'CF'}</div>
            <div className="text-gray-600">{venta.cliente?.direccion || ''}</div>
          </div>
          <div className="card">
            <div className="text-gray-500">Atendido por</div>
            <div className="font-medium">{(venta as any)?.usuario?.nombre || (venta as any)?.usuario?.nombreUsuario || ''}</div>
          </div>
        </section>

        <section className="mt-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="th">Descripción</th>
                <th className="th text-right">Cantidad</th>
                <th className="th text-right">Precio</th>
                <th className="th text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles.map((d, idx) => (
                <tr key={idx} className="border-b">
                  <td className="td">{d.descripcion || d.producto?.descripcion || '-'}</td>
                  <td className="td text-right">{Number(d.cantidad || 0).toFixed(3)}</td>
                  <td className="td text-right">Q {Number(d.precioUnitario || 0).toFixed(2)}</td>
                  <td className="td text-right">Q {Number(d.subtotal || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="mt-4 flex flex-col items-end gap-1 text-sm">
          <div>Forma de pago: <span className="font-medium">{venta.formaPago || '-'}</span></div>
          {venta.formaPago === 'EFECTIVO' && (
            <>
              <div>Recibido: <span className="font-medium">Q {Number(venta.recibido || 0).toFixed(2)}</span></div>
              <div>Cambio: <span className="font-medium">Q {Number(venta.cambio || 0).toFixed(2)}</span></div>
            </>
          )}
          <div className="text-lg">Total: <span className="font-semibold">Q {Number(venta.total || 0).toFixed(2)}</span></div>
        </footer>
      </div>
    </div>
  )
}

