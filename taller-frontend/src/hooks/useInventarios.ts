import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useInventarios() {
  const qc = useQueryClient()
  const existencias = () => useQuery({ queryKey: ['inventarios','existencias'], queryFn: async () => (await api.get('/inventarios')).data })
  const movimientos = (params?: any) => useQuery({ queryKey: ['inventarios','movimientos', params], queryFn: async () => (await api.get('/inventarios/movimientos/listado', { params })).data })
  const ajustar = useMutation({ mutationFn: async (dto: any) => (await api.post('/inventarios/movimientos', dto)).data, onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventarios','existencias'] }); qc.invalidateQueries({ queryKey: ['inventarios','movimientos'] }) } })
  return { existencias, movimientos, ajustar }
}
