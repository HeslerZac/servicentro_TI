import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card'
import { api } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import { Spinner } from '../../components/ui/Spinner'

type Cliente = { id: string; nombre: string; nit?: string; direccion?: string; telefono?: string; correo?: string }

export function ClienteForm({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState<Cliente>({ id: '', nombre: '', nit: 'CF', direccion: '', telefono: '', correo: '' })
  const [loading, setLoading] = useState(mode==='edit')

  useEffect(() => {
    if (mode==='edit' && id) {
      (async () => {
        try { const { data } = await api.client.get(`/clientes/${id}`); setForm(data) }
        catch (e: any) { toast.error(e?.response?.data?.message || 'Error cargando cliente') }
        finally { setLoading(false) }
      })()
    }
  }, [id, mode, toast])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (mode==='create') { await api.client.post('/clientes', { nombre: form.nombre, nit: form.nit, direccion: form.direccion, telefono: form.telefono, correo: form.correo }); toast.success('Cliente creado') }
      else if (id) { await api.client.patch(`/clientes/${id}`, { nombre: form.nombre, nit: form.nit, direccion: form.direccion, telefono: form.telefono, correo: form.correo }); toast.success('Cliente actualizado') }
      nav('/clientes')
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Error guardando cliente') }
  }

  if (loading) return <div className="flex items-center gap-2 text-sm text-gray-600"><Spinner /> Cargando...</div>

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader title={`${mode==='create' ? 'Nuevo' : 'Editar'} cliente`} />
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Nombre</label>
            <input className="input" name="nombre" value={form.nombre} onChange={onChange} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">NIT</label>
              <input className="input" name="nit" value={form.nit || ''} onChange={onChange} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input className="input" name="telefono" value={form.telefono || ''} onChange={onChange} />
            </div>
          </div>
          <div>
            <label className="label">Correo</label>
            <input className="input" type="email" name="correo" value={form.correo || ''} onChange={onChange} />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input className="input" name="direccion" value={form.direccion || ''} onChange={onChange} />
          </div>
          <div className="flex gap-2">
            <button className="btn" type="submit">Guardar</button>
            <button className="btn btn-secondary" type="button" onClick={()=>nav('/clientes')}>Cancelar</button>
          </div>
        </form>
      </Card>
    </div>
  )
}

