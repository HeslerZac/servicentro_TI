import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useVentas } from '../../hooks/useVentas'
import { Card, CardHeader } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import type { ColumnDef } from '@tanstack/react-table'
import { formatQ } from '../../lib/format'
import { exportToCsv } from '../../lib/csv'

type Venta = {
  id: string
  numero: number
  creadaEn: string
  cliente: { nombre: string }
  total: number
  impuestos: number
  estado: string
}

export default function VentasListado() {
  const [sp, setSp] = useSearchParams()
  const desde = sp.get('desde') || ''
  const hasta = sp.get('hasta') || ''
  const qtext = sp.get('q') || ''
  const ventas = useVentas().list({ desde: desde || undefined, hasta: hasta || undefined, q: qtext || undefined })
  const data = ventas.data || []

  const columns = useMemo<ColumnDef<Venta>[]>(() => [
    {
      accessorKey: 'numero',
      header: 'Número',
      cell: ({ row }) => (
        <Link to={`/ventas/${row.original.id}`} className="text-blue-600 hover:underline">
          {row.original.numero}
        </Link>
      ),
    },
    {
      accessorKey: 'creadaEn',
      header: 'Fecha',
      cell: ({ row }) => new Date(row.original.creadaEn).toLocaleString(),
    },
    { accessorFn: (row) => row.cliente?.nombre, header: 'Cliente' },
    { accessorKey: 'estado', header: 'Estado' },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => formatQ(row.original.total),
      meta: { className: 'text-right' },
    },
  ], [])

  const handleExport = () => {
    const dataToExport = data.map((v: Venta) => ({
      Fecha: v.creadaEn,
      Número: v.numero,
      Cliente: v.cliente?.nombre,
      Total: v.total,
      Impuestos: v.impuestos,
    }))
    exportToCsv('ventas.csv', dataToExport, [
      { key: 'Fecha', header: 'Fecha' },
      { key: 'Número', header: 'Número' },
      { key: 'Cliente', header: 'Cliente' },
      { key: 'Total', header: 'Total' },
      { key: 'Impuestos', header: 'Impuestos' },
    ])
  }

  return (
    <Card>
      <CardHeader title={`Ventas (${data.length})`} actions={<button className="btn btn-secondary" onClick={handleExport}>Exportar CSV</button>} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input className="input" type="date" value={desde} onChange={(e) => { const p = new URLSearchParams(sp); if (e.target.value) p.set('desde', e.target.value); else p.delete('desde'); setSp(p, { replace: true }) }} />
        <input className="input" type="date" value={hasta} onChange={(e) => { const p = new URLSearchParams(sp); if (e.target.value) p.set('hasta', e.target.value); else p.delete('hasta'); setSp(p, { replace: true }) }} />
      </div>
      <DataTable columns={columns} data={data} />
    </Card>
  )
}
