import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useFacturacion() {
  const qc = useQueryClient()
  const list = useQuery({ queryKey: ['facturacion'], queryFn: async () => (await api.get('/facturacion')).data })
  const emitir = useMutation({ mutationFn: async (dto: any) => (await api.post('/facturacion', dto)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['facturacion'] }) })
  return { list, emitir }
}

