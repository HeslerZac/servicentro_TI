import { Card, CardHeader } from '../../components/ui/Card'
import { useCaja } from '../../hooks/useCaja'
import { useState } from 'react'
import { useToast } from '../../components/ui/Toast'

export default function CajaEstado() {
  const { getSesionActual, getResumen, abrir, cerrar } = useCaja()
  const { data: sesion, refetch, isLoading } = getSesionActual()
  const resumenQuery = getResumen()
  const [saldoInicial, setSaldoInicial] = useState('0.00')
  const [saldoReal, setSaldoReal] = useState('0.00')
  const [observaciones, setObservaciones] = useState('')
  const toast = useToast()

  if (isLoading) return <div>Cargando...</div>

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader title="Caja" />
        <div className="p-4 space-y-4 text-sm">
          <div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${sesion ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              Estado: {sesion ? 'ABIERTA' : 'CERRADA'}
            </span>
          </div>
          {!sesion ? (
            <div className="space-y-2">
              <div>
                <label className="label">Saldo inicial (efectivo)</label>
                <input className="input" type="number" step="0.01" value={saldoInicial} onChange={(e)=>setSaldoInicial(e.target.value)} />
              </div>
              <button className="btn" onClick={async()=>{
                try { await abrir.mutateAsync({ saldoInicialEfectivo: (Number(saldoInicial||0)).toFixed(2) }); toast.success('Caja abierta'); refetch() }
                catch(e:any){ toast.error(e?.response?.data?.message || 'No se pudo abrir caja') }
              }}>Abrir caja</button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-gray-500">Apertura</div>
                  <div>{new Date(sesion.fechaApertura).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Saldo inicial</div>
                  <div>Q {Number(sesion.saldoInicialEfectivo||0).toFixed(2)}</div>
                </div>
              </div>
              {resumenQuery.data && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="card"><div className="text-gray-500">Efectivo</div><div className="text-lg font-semibold">Q {Number(resumenQuery.data.sesion.totalEfectivo||0).toFixed(2)}</div></div>
                  <div className="card"><div className="text-gray-500">Tarjeta</div><div className="text-lg font-semibold">Q {Number(resumenQuery.data.sesion.totalTarjeta||0).toFixed(2)}</div></div>
                  <div className="card"><div className="text-gray-500">Transfer</div><div className="text-lg font-semibold">Q {Number(resumenQuery.data.sesion.totalTransfer||0).toFixed(2)}</div></div>
                  <div className="card"><div className="text-gray-500">Ventas</div><div className="text-lg font-semibold">{resumenQuery.data.ventasCount} (Q {Number(resumenQuery.data.ventasTotal||0).toFixed(2)})</div></div>
                </div>
              )}
              <div>
                <label className="label">Saldo real contado (efectivo)</label>
                <input className="input" type="number" step="0.01" value={saldoReal} onChange={(e)=>setSaldoReal(e.target.value)} />
              </div>
              <div>
                <label className="label">Observaciones</label>
                <input className="input" value={observaciones} onChange={(e)=>setObservaciones(e.target.value)} />
              </div>
              <button className="btn btn-secondary" onClick={async()=>{
                try { await cerrar.mutateAsync({ saldoRealEfectivo: (Number(saldoReal||0)).toFixed(2), observaciones: observaciones || undefined }); toast.success('Caja cerrada'); refetch() }
                catch(e:any){ toast.error(e?.response?.data?.message || 'No se pudo cerrar caja') }
              }}>Cerrar caja</button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
