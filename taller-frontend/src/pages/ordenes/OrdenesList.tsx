import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useOrdenes, type FiltrosOrden } from '../../hooks/useOrdenes'
import { EstadoPill } from '../../components/ui/EstadoPill'
import { useAuth } from '../../auth/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { DataTable } from '../../components/ui/DataTable'
import type { ColumnDef } from '@tanstack/react-table'
import { Card, CardHeader } from '../../components/ui/Card'

const ESTADOS = ['TODAS', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'] as const
type EstadoChip = typeof ESTADOS[number]

type Orden = {
  id: string
  numero: string
  cliente?: { nombre?: string }
  estado: 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA' | string
  creadaEn: string
  total?: string
}

export function OrdenesList() {
  const [sp, setSp] = useSearchParams()
  const estadoChip: EstadoChip = (sp.get('estado') as EstadoChip) || 'EN_CURSO'
  const desde = sp.get('desde') || ''
  const hasta = sp.get('hasta') || ''
  const q = sp.get('q') || ''

  const filtros: FiltrosOrden = useMemo(
    () => ({
      estado: estadoChip === 'TODAS' ? undefined : (estadoChip as FiltrosOrden['estado']),
      desde: desde || undefined,
      hasta: hasta || undefined,
      q: q || undefined,
    }),
    [estadoChip, desde, hasta, q],
  )

  const ordenesHook = useOrdenes()
  const res = ordenesHook.list(filtros)
  const data = (res.data as Orden[]) || []
  const isFetching = res.isFetching
  const { finalizar, cancelar } = ordenesHook
  const { usuario } = useAuth()
  const toast = useToast()
  const nav = useNavigate()

  const setParam = (k: string, v?: string) => {
    const next = new URLSearchParams(sp)
    if (v && v.length) next.set(k, v)
    else next.delete(k)
    setSp(next, { replace: true })
  }

  const columns = useMemo<ColumnDef<Orden>[]>(
    () => [
      { accessorKey: 'numero', header: '# Orden' },
      { accessorFn: (row) => row.cliente?.nombre || '-', header: 'Cliente' },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => <EstadoPill estado={row.original.estado} />,
      },
      {
        accessorKey: 'creadaEn',
        header: 'Creada',
        cell: ({ row }) => new Date(row.original.creadaEn).toLocaleString(),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => Number(row.original.total || 0).toFixed(2),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const o = row.original
          const puede = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'SECRETARIA'
          return (
            <div className="flex items-center justify-end gap-2">
              <Link to={`/ordenes/${o.id}`} className="text-blue-600 hover:underline">
                Ver
              </Link>
              {puede && o.estado === 'EN_CURSO' && (
                <>
                  <button
                    className="btn btn-secondary"
                    disabled={isFetching}
                    onClick={async () => {
                      if (!confirm('¿Finalizar esta orden (sin cobrar)?')) return
                      try {
                        await finalizar.mutateAsync(o.id)
                        toast.success('Orden finalizada')
                      } catch (e: any) {
                        toast.error(e?.response?.data?.message || 'No se pudo finalizar')
                      }
                    }}
                    title="Finalizar"
                  >
                    Finalizar
                  </button>
                  <Link className="btn" to={`/ordenes/${o.id}/cobro`}>
                    Cobrar
                  </Link>
                  <button
                    className="btn"
                    disabled={isFetching}
                    onClick={async () => {
                      if (!confirm('¿Cancelar la orden?')) return
                      try {
                        await cancelar.mutateAsync({ id: o.id })
                        toast.success('Orden cancelada')
                      } catch (e: any) {
                        toast.error(e?.response?.data?.message || 'No se pudo cancelar')
                      }
                    }}
                    title="Cancelar"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          )
        },
      },
    ],
    [isFetching, usuario, cancelar, finalizar, nav, toast],
  )

  return (
    <Card>
      <CardHeader title="Órdenes de Servicio" actions={<Link to="/ordenes/nueva" className="btn">Nueva Orden</Link>} />
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex gap-2">
          {ESTADOS.map((e) => {
            const active = estadoChip === e
            return (
              <button
                key={e}
                onClick={() => setParam('estado', e)}
                className={`px-3 py-1 rounded-full text-sm border ${active ? 'bg-black text-white' : 'bg-white'}`}
              >
                {e.replace('_', ' ')}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Desde</label>
          <input type="date" value={desde} onChange={(e) => setParam('desde', e.target.value)} className="border rounded px-2 py-1 text-sm" />
          <label className="text-sm">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setParam('hasta', e.target.value)} className="border rounded px-2 py-1 text-sm" />
        </div>
      </div>
      <DataTable columns={columns} data={data} />
    </Card>
  )
}

