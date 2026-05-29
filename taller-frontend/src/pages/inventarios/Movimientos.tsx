import { useState } from 'react'
import { useInventarios } from '../../hooks/useInventarios'
import { Card, CardHeader } from '../../components/ui/Card'
import { Table, THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import { useProductos } from '../../hooks/useProductos'
import { useBodegas } from '../../hooks/useBodegas'
import { Combobox } from '../../components/ui/Combobox'

export default function Movimientos() {
  const [productoId, setProductoId] = useState('')
  const [bodegaId, setBodegaId] = useState('')
  const [productoQuery, setProductoQuery] = useState('')
  const [bodegaQuery, setBodegaQuery] = useState('')

  const { data: productosResp } = useProductos().list()
  const productos = (productosResp as any)?.items ?? []
  const { data: bodegas } = useBodegas().list()

  const q = useInventarios().movimientos({ productoId: productoId || undefined, bodegaId: bodegaId || undefined })
  const data = q.data || []

  return (
    <Card>
      <CardHeader title={`Movimientos (${data.length})`} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <Combobox<any>
          label="Filtrar por Producto"
          options={productos || []}
          value={productoQuery}
          onChange={(query) => {
            setProductoQuery(query)
            const selected = productos?.find((p: any) => p.descripcion.toLowerCase() === query.toLowerCase())
            setProductoId(selected?.id || '')
          }}
          displayValue={(p) => p.descripcion}
          valueKey={(p) => p.descripcion}
        />
        <Combobox<any>
          label="Filtrar por Bodega"
          options={bodegas || []}
          value={bodegaQuery}
          onChange={(query) => {
            setBodegaQuery(query)
            const selected = bodegas?.find((b: any) => b.nombre.toLowerCase() === query.toLowerCase())
            setBodegaId(selected?.id || '')
          }}
          displayValue={(b) => b.nombre}
          valueKey={(b) => b.nombre}
        />
      </div>
      <Table>
        <THead>
          <Th>Fecha</Th>
          <Th>Tipo</Th>
          <Th>Producto</Th>
          <Th>Bodega</Th>
          <Th className="text-right">Cantidad</Th>
          <Th>Motivo</Th>
          <Th>Referencia</Th>
        </THead>
        <TBody>
          {data.map((m: any) => (
            <Tr key={m.id}>
              <Td>{new Date(m.creadoEn).toLocaleString()}</Td>
              <Td>{m.tipo}</Td>
              <Td>{m.producto?.descripcion || '-'}</Td>
              <Td>{m.bodega?.nombre || '-'}</Td>
              <Td className="text-right">{Number(m.cantidad || 0).toFixed(3)}</Td>
              <Td>{m.motivo || '-'}</Td>
              <Td>{m.referencia || '-'}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}
