import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

type Rango = { desde: string; hasta: string }

type Estado = {
  rangosCerrados: Rango[]
  ultimoCierre?: Rango
  isFechaCerrada: (isoDate: string) => boolean
}

const Ctx = createContext<Estado | null>(null)

export function PeriodoCerradoProvider({ children }: { children: React.ReactNode }) {
  const q = useQuery({
    queryKey: ['cierres','estado'],
    queryFn: async () => {
      const { data } = await api.get('/cierres')
      return data as any[]
    },
    staleTime: 60_000,
  })

  const rangos: Rango[] = (q.data || []).map((c: any) => ({
    desde: (c.desde || c.periodo?.desde || c.periodo?.inicio || '').slice(0,10),
    hasta: (c.hasta || c.periodo?.hasta || c.periodo?.fin || '').slice(0,10),
  })).filter(r => r.desde && r.hasta)

  const ultimo = rangos.length ? rangos[rangos.length - 1] : undefined

  const isFechaCerrada = (iso: string) => {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return false
    const ymd = d.toISOString().slice(0,10)
    return rangos.some(r => ymd >= r.desde && ymd <= r.hasta)
  }

  const value: Estado = { rangosCerrados: rangos, ultimoCierre: ultimo, isFechaCerrada }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePeriodoCerrado() {
  const v = useContext(Ctx)
  if (!v) throw new Error('usePeriodoCerrado must be used within PeriodoCerradoProvider')
  return v
}
