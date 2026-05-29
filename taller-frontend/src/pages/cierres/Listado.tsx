import { useCierres } from '../../hooks/useCierres'
import { Card, CardHeader } from '../../components/ui/Card'
import { Table, THead, Th, TBody, Tr, Td } from '../../components/ui/Table'

export default function CierresListado() {
  const { list } = useCierres()
  const items = list.data || []
  return (
    <Card>
      <CardHeader title={`Cierres (${items.length})`} />
      <Table>
        <THead>
          <Th>Período</Th>
          <Th>Usuario</Th>
          <Th className="text-right">Total</Th>
          <Th>Estado</Th>
        </THead>
        <TBody>
          {items.map((c: any) => (
            <Tr key={c.id}>
              <Td>{c.periodo || `${c.desde} - ${c.hasta}`}</Td>
              <Td>{c.usuario?.nombreUsuario || '-'}</Td>
              <Td className="text-right">Q {Number(c.total||0).toFixed(2)}</Td>
              <Td>{c.estado || 'CERRADO'}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}

