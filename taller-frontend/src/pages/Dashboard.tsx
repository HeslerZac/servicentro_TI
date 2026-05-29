import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Card, CardHeader } from '../components/ui/Card'
import { Skeleton, SkeletonLines } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'
import { Sparkline } from '../components/ui/Sparkline'
import { useNavigate } from 'react-router-dom'

type KPIs = { 
  ventasDelDia: number; 
  ordenesEnCurso: number; 
  productosBajoStock: { p_descripcion: string; b_nombre: string; e_cantidad: string }[]; 
  umbral: number 
}
type Punto = { fecha: string; total: number }
type MasVendido = { productoId: string; descripcion: string; cantidad: number; total: number }

export function Dashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [serie, setSerie] = useState<Punto[]>([])
  const [top, setTop] = useState<MasVendido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()
  const nav = useNavigate()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [k, s, t] = await Promise.all([
          api.client.get('/dashboard/kpis'),
          api.client.get('/dashboard/ventas-ultimos-30-dias'),
          api.client.get('/dashboard/productos-mas-vendidos?limite=5&dias=30'),
        ])
        if (!mounted) return
        setKpis(k.data)
        setSerie(s.data)
        setTop(t.data)
      } catch (e: any) {
        const msg = e?.response?.data?.message || 'Error cargando dashboard'
        setError(msg)
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><Skeleton className="h-5 w-32 mb-2" /><Skeleton className="h-6 w-20" /></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardHeader title="Ventas últimos 30 días" /><SkeletonLines lines={6} /></Card>
          <Card><CardHeader title="Top productos" /><SkeletonLines lines={6} /></Card>
        </div>
        <Card><CardHeader title="Productos con Bajo Stock" /><SkeletonLines lines={4} /></Card>
      </div>
    )
  }
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between"><div className="text-sm text-gray-500">Ventas del día</div><button className="text-xs text-blue-600" onClick={()=>{
            const d = new Date().toISOString().slice(0,10);
            nav(`/ventas?desde=${d}&hasta=${d}`)
          }}>Ver detalle</button></div>
          <div className="text-2xl font-semibold">{kpis?.ventasDelDia ?? 0}</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between"><div className="text-sm text-gray-500">Órdenes en curso</div><button className="text-xs text-blue-600" onClick={()=>nav('/ordenes?estado=EN_CURSO')}>Ver detalle</button></div>
          <div className="text-2xl font-semibold">{kpis?.ordenesEnCurso ?? 0}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Umbral de Stock Bajo</div>
          <div className="text-2xl font-semibold">{kpis?.umbral ?? 0}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Ventas últimos 30 días" />
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Total: {serie.reduce((a, b) => a + (b.total || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}</div>
            <button className="text-xs text-blue-600" onClick={()=>nav('/ventas')}>Ver detalle</button>
          </div>
          <Sparkline values={serie.map(p => p.total)} />
        </Card>
        <Card>
          <CardHeader title="Top 5 productos más vendidos (30 días)" />
          <ul className="text-sm">
            {top.map((t) => (
              <li key={t.productoId} className="flex justify-between py-1 border-b last:border-none">
                <button className="text-left text-blue-600" onClick={()=>nav(`/ventas?q=${encodeURIComponent(t.descripcion)}`)}>{t.descripcion}</button>
                <span className="text-gray-600">{t.cantidad} uds · {Number(t.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title={`Productos con Stock Bajo (<= ${kpis?.umbral ?? 0})`} />
        <ul className="text-sm space-y-1">
          {(kpis?.productosBajoStock ?? []).map((p, i) => (
            <li key={i} className="flex justify-between py-1 border-b last:border-none">
              <span>{p.p_descripcion} <span className="text-gray-500">en {p.b_nombre}</span></span>
              <span className="font-medium">{p.e_cantidad}</span>
            </li>
          ))}
          {(kpis?.productosBajoStock ?? []).length === 0 && (
            <p className="text-gray-500">No hay productos con stock bajo.</p>
          )}
        </ul>
      </Card>
    </div>
  )
}
