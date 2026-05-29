import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export type CajaSesion = {
  id: string
  estado: 'ABIERTA' | 'CERRADA'
  fechaApertura: string
  fechaCierre?: string | null
  saldoInicialEfectivo: string
  saldoTeoricoEfectivo?: string
  saldoRealEfectivo?: string | null
  diferencia?: string | null
  totalEfectivo?: string
  totalTarjeta?: string
  totalTransfer?: string
}

export function useCaja() {
  const qc = useQueryClient()

  const getSesionActual = () =>
    useQuery({
      queryKey: ['caja', 'sesion-actual'],
      queryFn: async () => {
        try {
          const { data } = await api.get('/caja/sesion-actual')
          return data as CajaSesion | null
        } catch (e: any) {
          const status = e?.response?.status
          if (status === 404 || status === 204) return null
          throw e
        }
      },
    })

  const getResumen = () =>
    useQuery({
      queryKey: ['caja', 'resumen'],
      queryFn: async () => (await api.get('/caja/resumen')).data as { sesion: CajaSesion; ventasCount: number; ventasTotal: string } | null,
    })

  const abrir = useMutation({
    mutationFn: async (dto: { saldoInicialEfectivo: string }) => (await api.post('/caja/apertura', dto)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caja', 'sesion-actual'] })
    },
  })

  const cerrar = useMutation({
    mutationFn: async (dto: { saldoRealEfectivo: string; observaciones?: string }) => (await api.post('/caja/cierre', dto)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caja', 'sesion-actual'] })
    },
  })

  return { getSesionActual, getResumen, abrir, cerrar }
}
