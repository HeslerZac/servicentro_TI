import { useState } from 'react'
import { useCatalogos } from '../../hooks/useCatalogos'
import { Card, CardHeader } from '../../components/ui/Card'
import { Table, THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import { useToast } from '../../components/ui/Toast'

export default function Marcas() {
  const { marcas, crearMarca, actualizarMarca } = useCatalogos()
  const [mostrarDesactivadas, setMostrarDesactivadas] = useState(false)
  const q = marcas({ incluirInactivos: mostrarDesactivadas })
  const toast = useToast()
  const [nombre, setNombre] = useState('')
  const crear = async () => {
    try { await crearMarca.mutateAsync({ nombre }); setNombre(''); toast.success('Marca creada') } catch (e: any) { toast.error(e?.response?.data?.message || 'Error') }
  }
  const renombrar = async (m: any) => {
    const nuevo = window.prompt('Nuevo nombre', m.nombre)
    if (!nuevo) return
    try { await actualizarMarca.mutateAsync({ id: m.id, dto: { nombre: nuevo } }); toast.success('Actualizada') } catch (e: any) { toast.error(e?.response?.data?.message || 'Error') }
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Nueva Marca" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="Nombre" value={nombre} onChange={(e)=>setNombre(e.target.value)} />
          <button className="btn" onClick={crear}>Crear</button>
        </div>
      </Card>
      <Card>
        <CardHeader title={`Marcas (${(q.data||[]).length})`} />
        <Table>
          <THead>
            <Th>Nombre</Th>
            <Th>Acciones</Th>
          </THead>
          <TBody>
            {(q.data||[]).map((m:any)=>(
              <Tr key={m.id}>
                <Td>{m.nombre}</Td>
                <Td><button className="btn btn-secondary" onClick={()=>renombrar(m)}>Renombrar</button></Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
      <div className="text-sm"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={mostrarDesactivadas} onChange={(e)=>setMostrarDesactivadas(e.target.checked)} /> Mostrar desactivadas</label></div>
    </div>
  )
}
