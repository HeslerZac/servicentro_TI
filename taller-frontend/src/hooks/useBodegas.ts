import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useBodegas() {
  const qc = useQueryClient()
  const list = (params?: any) => useQuery({ queryKey: ['bodegas', params], queryFn: async () => (await api.get('/bodegas', { params })).data })
  const get = (id: string) => useQuery({ queryKey: ['bodega', id], queryFn: async () => (await api.get(`/bodegas/${id}`)).data })
  const create = useMutation({ mutationFn: async (dto: any) => (await api.post('/bodegas', dto)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['bodegas'] }) })
  const update = useMutation({ mutationFn: async ({ id, dto }: { id: string; dto: any }) => (await api.patch(`/bodegas/${id}`, dto)).data, onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['bodegas'] }); qc.invalidateQueries({ queryKey: ['bodega', v.id] }) } })
  const remove = useMutation({ mutationFn: async (id: string) => (await api.delete(`/bodegas/${id}`)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['bodegas'] }) })
  return { list, get, create, update, remove }
}
