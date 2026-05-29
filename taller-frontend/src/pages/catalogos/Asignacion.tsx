import { useState } from 'react'
import { useCatalogos } from '../../hooks/useCatalogos'
import { Card, CardHeader } from '../../components/ui/Card'

export default function Asignacion() {
  const { categorias, marcas, marcasPorCategoria, asignarMarcas } = useCatalogos()
  const [catId, setCatId] = useState<string>('')
  const sel = catId ? marcasPorCategoria(catId) : ({} as any)
  const selected: string[] = sel?.data?.map((m: any)=>m.id) || []

  const [marcaSet, setMarcaSet] = useState<Set<string>>(new Set())

  const toggle = (id: string, checked: boolean) => {
    setMarcaSet((prev) => {
      const s = new Set(prev)
      if (checked) s.add(id); else s.delete(id)
      return s
    })
  }

  const save = async () => {
    await asignarMarcas.mutateAsync({ id: catId, marcas: Array.from(marcaSet) })
    setMarcaSet(new Set())
  }

  return (
    <Card>
      <CardHeader title="Asignación Categoria ↔ Marcas" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Categoría</label>
          <select className="input" value={catId} onChange={(e)=>{ setCatId(e.target.value); setMarcaSet(new Set(selected)) }}>
            <option value="">Seleccione</option>
            {(categorias().data||[]).map((c:any)=>(<option key={c.id} value={c.id}>{c.nombre}</option>))}
          </select>
        </div>
        <div>
          <div className="label">Marcas</div>
          <div className="grid grid-cols-2 gap-2">
            {(marcas().data||[]).map((m:any)=>{
              const checked = marcaSet.size ? marcaSet.has(m.id) : selected.includes(m.id)
              return (
                <label key={m.id} className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={checked} onChange={(e)=>toggle(m.id, e.target.checked)} />
                  {m.nombre}
                </label>
              )
            })}
          </div>
          {catId && <div className="mt-3"><button className="btn" onClick={save}>Guardar</button></div>}
        </div>
      </div>
    </Card>
  )
}
