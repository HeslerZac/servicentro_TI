import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card'
import { useAuth } from '../../auth/AuthContext'
import { useVehiculos } from '../../hooks/useVehiculos'
import { DataTable } from '../../components/ui/DataTable'
import type { ColumnDef } from '@tanstack/react-table'
import { exportToCsv } from '../../lib/csv'

type Vehiculo = { id: string; placa: string; marca?: { nombre: string }; linea?: string; modelo?: string; color?: string; cliente?: { id: string; nombre: string } }

export function VehiculosList() {
  const { usuario } = useAuth()
  const esAdminOSec = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'SECRETARIA'
  const { list: vehiculosQuery } = useVehiculos()
  const { data: items, isLoading, error } = vehiculosQuery()

  const columns = useMemo<ColumnDef<Vehiculo>[]>(() => [
    {
      accessorKey: 'placa',
      header: 'Placa',
      cell: ({ row }) => (
        <Link to={`/vehiculos/${row.original.id}`} className="text-blue-600 hover:underline">
          {row.original.placa}
        </Link>
      ),
    },
    { accessorFn: (row) => row.marca?.nombre, header: 'Marca' },
    { accessorKey: 'linea', header: 'Línea' },
    { accessorFn: (row) => row.cliente?.nombre, header: 'Cliente' },
  ], [])

  const handleExport = () => {
    const dataToExport = items || []
    exportToCsv('vehiculos.csv', dataToExport, [
      { key: 'placa', header: 'Placa' },
      { key: 'marca.nombre', header: 'Marca' },
      { key: 'linea', header: 'Línea' },
      { key: 'modelo', header: 'Modelo' },
      { key: 'color', header: 'Color' },
      { key: 'cliente.nombre', header: 'Cliente' },
    ])
  }

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div className="text-red-600">{error.message}</div>

  return (
    <Card>
      <CardHeader title="Vehículos" actions={
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={handleExport}>Exportar CSV</button>
          {esAdminOSec && <Link className="btn" to="/vehiculos/nuevo">Nuevo</Link>}
        </div>
      } />
      <DataTable columns={columns} data={items || []} />
    </Card>
  )
}
