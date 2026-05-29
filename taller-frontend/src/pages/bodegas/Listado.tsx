import { useBodegas } from '../../hooks/useBodegas'
import { Card, CardHeader } from '../../components/ui/Card'
import { Table, THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import { Link } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'

export default function BodegasListado() {
  const { list, remove } = useBodegas()
  const toast = useToast()
  const { usuario } = useAuth()
  const esAdmin = usuario?.rol === 'ADMINISTRADOR'
  const [mostrarDesactivados, setMostrarDesactivados] = useState(false)
  const q = list({ incluirInactivos: mostrarDesactivados })

  const onEliminar = async (id: string) => {
    if (!confirm('¿Desactivar bodega? Esta acción no se puede deshacer si la bodega tiene existencias.')) return
    try { await remove.mutateAsync(id); toast.success('Bodega desactivada') } catch (e: any) { toast.error(e?.response?.data?.message || 'No se pudo desactivar') }
  }

  return (
    <Card>
      <CardHeader title="Bodegas" actions={<div className="flex items-center gap-3">{esAdmin && <Link className="btn" to="/bodegas/nueva">Nueva</Link>}<label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={mostrarDesactivados} onChange={(e)=>setMostrarDesactivados(e.target.checked)} /> Mostrar desactivadas</label></div>} />
      <Table>
        <THead>
          <Th>Código</Th>
          <Th>Nombre</Th>
          <Th>Ubicación</Th>
          <Th>Estado</Th>
          <Th>Acciones</Th>
        </THead>
        <TBody>
          {(q.data || []).map((b: any) => (
            <Tr key={b.id}>
              <Td className="font-mono">{b.codigo}</Td>
              <Td>{b.nombre}</Td>
              <Td>{b.ubicacion || '-'}</Td>
              <Td>{b.estaActiva ? 'ACTIVA' : 'INACTIVA'}</Td>
              <Td>
                <div className="flex gap-2">
                  {esAdmin && <Link className="btn btn-secondary" to={`/bodegas/${b.id}`}>Editar</Link>}
                  {esAdmin && <button className="btn" onClick={()=>onEliminar(b.id)} disabled={!b.estaActiva}>Desactivar</button>}
                </div>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}
