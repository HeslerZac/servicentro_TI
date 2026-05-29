import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card'
import { api } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import { Spinner } from '../../components/ui/Spinner'

type Cliente = { id: string; nombre: string }
type Vehiculo = { placa: string; marca?: string; linea?: string; modelo?: string; color?: string; clienteId?: string }

export function VehiculoForm({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [form, setForm] = useState<Vehiculo>({ placa: '', marca: '', linea: '', modelo: '', color: '', clienteId: '' })
  const [loading, setLoading] = useState(mode==='edit')

  useEffect(() => { (async () => {
    try { const { data } = await api.client.get('/clientes'); setClientes(data) }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Error cargando clientes') }
  })() }, [toast])

  useEffect(() => {
    if (mode==='edit' && id) {
      (async () => {
        try { const { data } = await api.client.get(`/vehiculos/${id}`); setForm({ placa: data.placa, marca: data.marca, linea: data.linea, modelo: data.modelo, color: data.color, clienteId: data.cliente?.id }) }
        catch (e: any) { toast.error(e?.response?.data?.message || 'Error cargando vehículo') }
        finally { setLoading(false) }
      })()
    }
  }, [id, mode, toast])

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (mode==='create') { await api.client.post('/vehiculos', form); toast.success('Vehículo creado') }
      else if (id) { await api.client.patch(`/vehiculos/${id}`, form); toast.success('Vehículo actualizado') }
      nav('/vehiculos')
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Error guardando vehículo') }
  }

  if (loading) return <div className="flex items-center gap-2 text-sm text-gray-600"><Spinner /> Cargando...</div>

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader title={`${mode==='create' ? 'Nuevo' : 'Editar'} vehículo`} />
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">Placa</label>
              <input className="input" name="placa" value={form.placa} onChange={onChange} required />
            </div>
            <div>
              <label className="label">Cliente</label>
              <select className="input" name="clienteId" value={form.clienteId || ''} onChange={onChange}>
                <option value="">Seleccione</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="label">Marca</label>
              <input className="input" name="marca" value={form.marca || ''} onChange={onChange} />
            </div>
            <div>
              <label className="label">Línea</label>
              <input className="input" name="linea" value={form.linea || ''} onChange={onChange} />
            </div>
            <div>
              <label className="label">Modelo</label>
              <input className="input" name="modelo" value={form.modelo || ''} onChange={onChange} />
            </div>
          </div>
          <div>
            <label className="label">Color</label>
            <input className="input" name="color" value={form.color || ''} onChange={onChange} />
          </div>
          <div className="flex gap-2">
            <button className="btn" type="submit">Guardar</button>
            <button className="btn btn-secondary" type="button" onClick={()=>nav('/vehiculos')}>Cancelar</button>
          </div>
        </form>
      </Card>
    </div>
  )
}

