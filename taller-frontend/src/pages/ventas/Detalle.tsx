import { useParams, useNavigate } from 'react-router-dom'
import { useVentas } from '../../hooks/useVentas'
import { Card, CardHeader } from '../../components/ui/Card'
import { Table, THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import { formatQ } from '../../lib/format'
import { useState } from 'react'
import { ModalEmitir } from '../facturacion/ModalEmitir'
import { useFacturacion } from '../../hooks/useFacturacion'
import { useToast } from '../../components/ui/Toast'
import { EstadoPill } from '../../components/ui/EstadoPill'

export default function VentaDetalle() {
  const { id } = useParams()
  const { get: getVenta } = useVentas()
  const { data: venta, isLoading } = getVenta(id!)
  const { emitir } = useFacturacion()
  const toast = useToast()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)

  if (isLoading) return <div>Cargando...</div>
  if (!venta) return <div>Venta no encontrada</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title={`Venta ${venta.numero}`}
          actions={
            <div className="flex gap-2">
              <button className="btn" onClick={() => setOpen(true)}>Emitir factura</button>
              <button className="btn btn-secondary" onClick={() => nav(`/ventas/${venta.id}/recibo`)}>Imprimir comprobante</button>
            </div>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div><span className="text-gray-500">Estado:</span> <EstadoPill estado={venta.estado} /></div>
          <div><span className="text-gray-500">Fecha:</span> {new Date(venta.creadaEn).toLocaleString()}</div>
          <div><span className="text-gray-500">Cliente:</span> {venta.cliente?.nombre || '-'}</div>
        </div>
      </Card>
      <Card>
        <CardHeader title="Detalles" />
        <Table>
          <THead>
            <Th>Descripción</Th>
            <Th className="text-right">Cantidad</Th>
            <Th className="text-right">Precio</Th>
            <Th className="text-right">Subtotal</Th>
          </THead>
          <TBody>
            {venta.detalles?.map((d: any) => (
              <Tr key={d.id}>
                <Td>{d.descripcion || d.producto?.descripcion || '-'}</Td>
                <Td className="text-right">{Number(d.cantidad || 0).toFixed(3)}</Td>
                <Td className="text-right">{formatQ(d.precioUnitario)}</Td>
                <Td className="text-right">{formatQ(d.subtotal)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
        <div className="flex flex-col items-end mt-4 space-y-1 text-sm">
          <div className="w-64 flex justify-between"><span className="text-gray-500">Subtotal:</span> <span>{formatQ(venta.subtotal)}</span></div>
          <div className="w-64 flex justify-between"><span className="text-gray-500">Descuento:</span> <span>{formatQ(venta.descuento)}</span></div>
          <div className="w-64 flex justify-between"><span className="text-gray-500">Impuestos:</span> <span>{formatQ(venta.impuestos)}</span></div>
          <div className="w-64 flex justify-between font-semibold"><span >Total:</span> <span>{formatQ(venta.total)}</span></div>
        </div>
      </Card>
      <ModalEmitir open={open} onClose={() => setOpen(false)} defaults={{ razonSocial: venta.cliente?.nombre || '', nit: (venta.cliente as any)?.nit || 'CF', direccion: (venta.cliente as any)?.direccion || '' }} onSubmit={async (data) => {
        try {
          await emitir.mutateAsync({ ventaId: venta.id, ...data });
          toast.success('Factura emitida');
          setOpen(false);
          nav('/facturacion');
        } catch (e: any) { toast.error(e?.response?.data?.message || 'Error emitiendo factura') }
      }} />
    </div>
  )
}
