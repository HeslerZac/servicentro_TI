import { useState } from 'react'
import { useCatalogos } from '../../hooks/useCatalogos'
import { Card, CardHeader } from '../../components/ui/Card'
import { Table, THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import { useToast } from '../../components/ui/Toast'

export default function Categorias() {
  const { categorias, crearCategoria, actualizarCategoria } = useCatalogos()
  const [mostrarDesactivadas, setMostrarDesactivadas] = useState(false)
  const q = categorias({ incluirInactivos: mostrarDesactivadas })
  const toast = useToast()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const crear = async () => {
    try { await crearCategoria.mutateAsync({ nombre, descripcion }); setNombre(''); setDescripcion(''); toast.success('Categoría creada') } catch (e: any) { toast.error(e?.response?.data?.message || 'Error') }
  }
  const renombrar = async (c: any) => {
    const nuevo = window.prompt('Nuevo nombre', c.nombre)
    if (!nuevo) return
    try { await actualizarCategoria.mutateAsync({ id: c.id, dto: { nombre: nuevo } }); toast.success('Actualizada') } catch (e: any) { toast.error(e?.response?.data?.message || 'Error') }
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Nueva Categoría" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="Nombre" value={nombre} onChange={(e)=>setNombre(e.target.value)} />
          <input className="input" placeholder="Descripción" value={descripcion} onChange={(e)=>setDescripcion(e.target.value)} />
          <button className="btn" onClick={crear}>Crear</button>
        </div>
      </Card>
      <Card>
        <CardHeader title={`Categorías (${(q.data||[]).length})`} />
        <Table>
          <THead>
            <Th>Nombre</Th>
            <Th>Descripción</Th>
            <Th>Acciones</Th>
          </THead>
          <TBody>
            {(q.data||[]).map((c:any)=>(
              <Tr key={c.id}>
                <Td>{c.nombre}</Td>
                <Td>{c.descripcion||'-'}</Td>
                <Td><button className="btn btn-secondary" onClick={()=>renombrar(c)}>Renombrar</button></Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
      <div className="text-sm"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={mostrarDesactivadas} onChange={(e)=>setMostrarDesactivadas(e.target.checked)} /> Mostrar desactivadas</label></div>
    </div>
  )
}
