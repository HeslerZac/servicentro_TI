import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { Card, CardHeader } from '../../components/ui/Card'
import { useProductos } from '../../hooks/useProductos'
import { useInventarios } from '../../hooks/useInventarios'
import { DataTable } from '../../components/ui/DataTable'
import type { ColumnDef } from '@tanstack/react-table'

type Producto = {
  id: string
  codigo: string
  descripcion: string
  marca?: { nombre: string } | string | null
  medida?: string
  precioA: string
  precioB: string
  precioMayorista: string
  estaActivo: boolean
}

export function ProductosList() {
  const { usuario } = useAuth()
  const toast = useToast()
  const { list: productosQuery, remove: removeMutation } = useProductos()
  const { data: existencias } = useInventarios().existencias()

  const { data: productosResp, isLoading, error } = productosQuery()
  const items = (productosResp as any)?.items ?? []

  const stockPorProducto = useMemo(() => {
    const map = new Map<string, { total: number; reservado: number }>()
    if (!existencias) return map
    for (const ex of existencias) {
      const key = ex.productoId
      const cur = map.get(key) || { total: 0, reservado: 0 }
      cur.total += ex.cantidad || 0
      cur.reservado += ex.cantidadReservada || 0
      map.set(key, cur)
    }
    return map
  }, [existencias])

  const onEliminar = async (id: string) => {
    if (!confirm('¿Desactivar producto? Esta acción es reversible creando de nuevo el producto con mismo código.')) return
    try {
      await removeMutation.mutateAsync(id)
      toast.success('Producto desactivado')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'No se pudo desactivar')
    }
  }

  const esAdmin = usuario?.rol === 'ADMINISTRADOR'

  const columns = useMemo<ColumnDef<Producto>[]>(() => [
    { accessorKey: 'codigo', header: 'Código' },
    { accessorKey: 'descripcion', header: 'Descripción' },
    { accessorFn: (row) => (typeof row.marca === 'string' ? row.marca : (row.marca as any)?.nombre), header: 'Marca' },
    { accessorKey: 'medida', header: 'Medida' },
    { accessorKey: 'precioA', header: 'Precio A' },
    { accessorKey: 'precioB', header: 'Precio B' },
    ...(esAdmin ? [{ accessorKey: 'precioMayorista', header: 'Mayorista' }] : []),
    {
      header: 'Stock Total',
      cell: ({ row }) => {
        const stock = stockPorProducto.get(row.original.id) || { total: 0, reservado: 0 }
        return stock.total.toFixed(3)
      }
    },
    {
      id: 'acciones',
      cell: ({ row }) => {
        const stock = stockPorProducto.get(row.original.id) || { total: 0, reservado: 0 }
        const puedeEliminar = stock.total <= 0
        return (
          <div className="flex gap-2">
            {esAdmin && (
              <Link className="btn btn-secondary" to={`/productos/${row.original.id}`}>Editar</Link>
            )}
            {esAdmin && (
              <button className="btn" onClick={() => onEliminar(row.original.id)} disabled={!puedeEliminar}>Eliminar</button>
            )}
          </div>
        )
      }
    }
  ], [esAdmin, stockPorProducto])

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div className="text-red-600">{error.message}</div>

  return (
    <Card>
      <CardHeader title="Productos" actions={esAdmin ? <Link className="btn" to="/productos/nuevo">Nuevo</Link> : null} />
      <DataTable columns={columns} data={items || []} />
    </Card>
  )
}
