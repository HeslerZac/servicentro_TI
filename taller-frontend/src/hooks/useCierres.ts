import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useCierres() {
  const qc = useQueryClient()
  const list = useQuery({ queryKey: ['cierres'], queryFn: async () => (await api.get('/cierres')).data })
  const generar = useMutation({ mutationFn: async (dto: any) => (await api.post('/cierres', dto)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['cierres'] }) })
  return { list, generar }
}

