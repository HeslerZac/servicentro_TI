import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export type FiltrosOrden = {
  estado?: 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA'
  desde?: string
  hasta?: string
  q?: string
}

export function useOrdenes() {
  const qc = useQueryClient()

  function list(filtros: FiltrosOrden = {}) {
    return useQuery({
      queryKey: ['ordenes', filtros],
      queryFn: async () => {
        const { data } = await api.get('/ordenes', {
          params: {
            estado: filtros.estado,
            fechaDesde: filtros.desde,
            fechaHasta: filtros.hasta,
            q: filtros.q,
          },
        })
        return (data.items ?? data) as Array<{
          id: string
          numero: string
          estado: 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA'
          total?: string
          creadaEn?: string
          cliente?: { nombre?: string }
        }>
      },
      staleTime: 30_000,
    })
  }

  const get = (id: string) =>
    useQuery({ queryKey: ['orden', id], queryFn: async () => (await api.get(`/ordenes/${id}`)).data })

  const finalizar = useMutation({
    mutationFn: async (id: string) => (await api.post(`/ordenes/${id}/finalizar`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ordenes'] })
      qc.invalidateQueries({ queryKey: ['ventas'] })
    },
  })

  const cancelar = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo?: string }) =>
      (await api.post(`/ordenes/${id}/cancelar`, { motivo })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes'] }),
  })

  return { list, get, finalizar, cancelar }
}
