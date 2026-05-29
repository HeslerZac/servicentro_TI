import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card'
import { useAuth } from '../../auth/AuthContext'
import { useClientes } from '../../hooks/useClientes'
import { DataTable } from '../../components/ui/DataTable'
import type { ColumnDef } from '@tanstack/react-table'
import { exportToCsv } from '../../lib/csv'

type Cliente = { id: string; nombre: string; nit?: string; direccion?: string; telefono?: string; correo?: string }

export function ClientesList() {
  const { usuario } = useAuth()
  const esAdminOSec = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'SECRETARIA'
  const { list: clientesQuery } = useClientes()
  const { data: items, isLoading, error } = clientesQuery()

  const columns = useMemo<ColumnDef<Cliente>[]>(() => [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <Link to={`/clientes/${row.original.id}`} className="text-blue-600 hover:underline">
          {row.original.nombre}
        </Link>
      ),
    },
    { accessorKey: 'nit', header: 'NIT', cell: ({ row }) => row.original.nit || 'CF' },
    { accessorKey: 'telefono', header: 'Teléfono', cell: ({ row }) => row.original.telefono || '-' },
    { accessorKey: 'correo', header: 'Correo', cell: ({ row }) => row.original.correo || '-' },
  ], [])

  const handleExport = () => {
    const dataToExport = items || []
    exportToCsv('clientes.csv', dataToExport, [
      { key: 'nombre', header: 'Nombre' },
      { key: 'nit', header: 'NIT' },
      { key: 'direccion', header: 'Dirección' },
      { key: 'telefono', header: 'Teléfono' },
      { key: 'correo', header: 'Correo' },
    ])
  }

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div className="text-red-600">{error.message}</div>

  return (
    <Card>
      <CardHeader title="Clientes" actions={
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={handleExport}>Exportar CSV</button>
          {esAdminOSec && <Link className="btn" to="/clientes/nuevo">Nuevo</Link>}
        </div>
      } />
      <DataTable columns={columns} data={items || []} />
    </Card>
  )
}
