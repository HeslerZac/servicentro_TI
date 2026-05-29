import { useInventarios } from '../../hooks/useInventarios'
import { Card, CardHeader } from '../../components/ui/Card'
import { Table, THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import { useState, useMemo } from 'react'

export default function Existencias() {
  const { existencias: existenciasQuery } = useInventarios()
  const { data: existenciasData } = existenciasQuery()
  const [producto, setProducto] = useState('')
  const [bodega, setBodega] = useState('')
  const data = existenciasData || []
  const filtered = useMemo(() => data.filter((e: any) => (producto ? e.producto.descripcion.toLowerCase().includes(producto.toLowerCase()) : true) && (bodega ? e.bodega.nombre.toLowerCase().includes(bodega.toLowerCase()) : true)), [data, producto, bodega])
  return (
    <Card>
      <CardHeader title={`Existencias (${filtered.length})`} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input className="input" placeholder="Producto" value={producto} onChange={(e)=>setProducto(e.target.value)} />
        <input className="input" placeholder="Bodega" value={bodega} onChange={(e)=>setBodega(e.target.value)} />
      </div>
      <Table>
        <THead>
          <Th>Producto</Th>
          <Th>Bodega</Th>
          <Th className="text-right">Cantidad</Th>
          <Th className="text-right">Reservada</Th>
        </THead>
        <TBody>
          {filtered.map((e: any) => (
            <Tr key={e.id}>
              <Td>{e.producto.descripcion}</Td>
              <Td>{e.bodega.nombre}</Td>
              <Td className="text-right">{Number(e.cantidad||0).toFixed(3)}</Td>
              <Td className="text-right">{Number(e.cantidadReservada||0).toFixed(3)}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}

