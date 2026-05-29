import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Card, CardHeader } from '../../components/ui/Card'
import { Table, THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import { SkeletonLines } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../auth/AuthContext'
import { EstadoPill } from '../../components/ui/EstadoPill'

type OrdenDetalleProducto = {
  id: string
  producto?: { id: string; descripcion: string }
  bodega?: { id: string; codigo: string; nombre: string }
  cantidad: string
  precioUnitario: string
  subtotal?: string
}

type OrdenDetalleServicio = {
  id: string
  descripcion: string
  costo: string
  precio: string
}

type Orden = {
  id: string
  numero: string
  estado: 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA'
  observaciones?: string
  cliente?: { nombre: string }
  vehiculo?: { placa: string }
  totalProductos: string
  totalServicios: string
  total: string
  creadaEn: string
  detallesProducto?: OrdenDetalleProducto[]
  detallesServicio?: OrdenDetalleServicio[]
  venta?: { id: string }
}

export function OrdenDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { usuario } = useAuth()
  const esAdminOSec = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'SECRETARIA'

  const [orden, setOrden] = useState<Orden | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.client.get(`/ordenes/${id}`)
      setOrden(data)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error cargando orden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onFinalizar = async () => {
    if (!id || !confirm('¿Está seguro de que desea finalizar esta orden? Esta acción descontará el inventario y no se puede revertir.')) return
    try {
      const { data } = await api.client.post(`/ordenes/${id}/finalizar`);
      toast.success('Orden finalizada con éxito');
      setOrden(data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'No se pudo finalizar la orden');
    }
  }

  const onCancelar = async () => {
    if (!id) return
    const motivo = window.prompt('Motivo de cancelación (opcional):')
    if (motivo === null) return; // User clicked cancel on prompt
    try {
      const { data } = await api.client.post(`/ordenes/${id}/cancelar`, { motivo: motivo || undefined })
      toast.success('Orden cancelada')
      setOrden(data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'No se pudo cancelar')
    }
  }

  if (loading) return <Card><CardHeader title="Detalle de Orden" /><SkeletonLines lines={8} /></Card>
  if (!orden) return <div>No encontrada</div>

  const puedeEditar = esAdminOSec && orden.estado === 'EN_CURSO'

  return (
    <div className="space-y-4 max-w-5xl">
      <Card>
        <CardHeader
          title={`Orden ${orden.numero}`}
          actions={
            <div className="flex gap-2">
              {orden.estado === 'EN_CURSO' && (
                <>
                  {puedeEditar && <Link className="btn btn-secondary" to={`/ordenes/${orden.id}/editar`}>Editar</Link>}
                  <button className="btn btn-secondary" onClick={onFinalizar}>Solo finalizar</button>
                  <button className="btn" onClick={() => navigate(`/ordenes/${orden.id}/cobro`)}>Finalizar y Cobrar</button>
                  <button className="btn btn-danger" onClick={onCancelar}>Cancelar</button>
                </>
              )}
              {orden.estado === 'FINALIZADA' && orden.venta?.id && (
                <Link className="btn" to={`/ventas/${orden.venta.id}`}>Ver Venta</Link>
              )}
            </div>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div><span className="text-gray-500">Estado:</span> <EstadoPill estado={orden.estado} /></div>
          <div><span className="text-gray-500">Cliente:</span> <span className="font-medium">{orden.cliente?.nombre || '-'}</span></div>
          <div><span className="text-gray-500">Vehículo:</span> <span className="font-medium">{orden.vehiculo?.placa || '-'}</span></div>
          <div><span className="text-gray-500">Creada:</span> <span className="font-medium">{new Date(orden.creadaEn).toLocaleString()}</span></div>
          <div className="md:col-span-2"><span className="text-gray-500">Observaciones:</span> <span className="font-medium">{orden.observaciones || '-'}</span></div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Productos" />
        <Table>
          <THead>
            <Th>Producto</Th>
            <Th>Bodega</Th>
            <Th className="text-right">Cantidad</Th>
            <Th className="text-right">Precio unitario</Th>
            <Th className="text-right">Subtotal</Th>
          </THead>
          <TBody>
            {(orden.detallesProducto || []).map((d) => (
              <Tr key={d.id}>
                <Td>{d.producto?.descripcion || '-'}</Td>
                <Td>{d.bodega ? `${d.bodega.codigo} - ${d.bodega.nombre}` : '-'}</Td>
                <Td className="text-right">{Number(d.cantidad || 0).toFixed(3)}</Td>
                <Td className="text-right">Q {Number(d.precioUnitario || 0).toFixed(2)}</Td>
                <Td className="text-right">Q {(d.subtotal != null ? Number(d.subtotal || 0) : Number(d.cantidad || 0) * Number(d.precioUnitario || 0)).toFixed(2)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <Card>
        <CardHeader title="Servicios" />
        <Table>
          <THead>
            <Th>Descripción</Th>
            <Th className="text-right">Precio</Th>
          </THead>
          <TBody>
            {(orden.detallesServicio || []).map((d) => (
              <Tr key={d.id}>
                <Td>{d.descripcion}</Td>
                <Td className="text-right">Q {Number(d.precio || 0).toFixed(2)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <div className="flex items-center justify-end gap-6 text-sm">
        <div className="text-gray-600">Total productos: <span className="font-medium">Q {Number(orden.totalProductos || 0).toFixed(2)}</span></div>
        <div className="text-gray-600">Total servicios: <span className="font-medium">Q {Number(orden.totalServicios || 0).toFixed(2)}</span></div>
        <div className="text-gray-900">Total: <span className="font-semibold">Q {Number(orden.total || 0).toFixed(2)}</span></div>
      </div>
    </div>
  )
}


