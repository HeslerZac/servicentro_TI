import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '../../lib/useDebounce'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

type Item = { id: string; label: string }

export function SelectAutocomplete({
  value,
  onChange,
  placeholder,
  resource,
  filter,
}: {
  value?: string
  onChange: (id: string, item?: any) => void
  placeholder?: string
  resource: 'productos' | 'bodegas'
  filter?: (raw: any) => boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search, 300)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const query = useQuery({
    queryKey: [resource, 'search', debounced],
    queryFn: async () => {
      // Estrategia: cargar todo y filtrar en cliente para compatibilidad
      const { data } = await api.get(`/${resource}`)
      let rows: any[] = data || []
      if (filter) rows = rows.filter(filter)
      if (debounced) {
        const q = debounced.toLowerCase()
        rows = rows.filter((r) =>
          resource === 'productos'
            ? (r.descripcion || '').toLowerCase().includes(q) || (r.codigo || '').toLowerCase().includes(q)
            : (r.nombre || '').toLowerCase().includes(q) || (r.codigo || '').toLowerCase().includes(q),
        )
      }
      return rows
    },
  })

  const items: Item[] = (query.data || []).map((r: any) => ({ id: r.id, label: resource === 'productos' ? `${r.codigo || ''} ${r.descripcion}`.trim() : `${r.codigo || ''} ${r.nombre}`.trim() }))
  const selected = (query.data || []).find((r: any) => r.id === value)

  return (
    <div className="relative" ref={ref}>
      <input
        className="input"
        placeholder={placeholder}
        value={selected ? (resource === 'productos' ? `${selected.codigo || ''} ${selected.descripcion}`.trim() : `${selected.codigo || ''} ${selected.nombre}`.trim()) : search}
        onChange={(e) => {
          setSearch(e.target.value)
          setOpen(true)
          onChange('', undefined)
        }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-white shadow">
          {(items.length ? items : [{ id: '', label: 'Sin resultados' }]).map((it) => (
            <button
              type="button"
              key={it.id || it.label}
              className="block w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:text-gray-400"
              disabled={!it.id}
              onClick={() => {
                const raw = (query.data || []).find((r: any) => r.id === it.id)
                onChange(it.id, raw)
                setSearch('')
                setOpen(false)
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

