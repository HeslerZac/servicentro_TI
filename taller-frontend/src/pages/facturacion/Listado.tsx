import { useFacturacion } from '../../hooks/useFacturacion'
import { Card, CardHeader } from '../../components/ui/Card'
import { Table, THead, Th, TBody, Tr, Td } from '../../components/ui/Table'

export default function FacturacionListado() {
  const { list } = useFacturacion()
  const items = list.data || []
  return (
    <Card>
      <CardHeader title={`Facturación (${items.length})`} />
      <Table>
        <THead>
          <Th>Número</Th>
          <Th>Fecha</Th>
          <Th>Cliente</Th>
          <Th className="text-right">Total</Th>
        </THead>
        <TBody>
          {items.map((f: any) => (
            <Tr key={f.id}>
              <Td>{f.numero}</Td>
              <Td>{new Date(f.fecha).toLocaleString()}</Td>
              <Td>{f.razonSocial || f.cliente?.nombre || '-'}</Td>
              <Td className="text-right">Q {Number(f.total||0).toFixed(2)}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}

