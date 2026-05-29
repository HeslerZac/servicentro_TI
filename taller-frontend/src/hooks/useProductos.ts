import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useProductos() {
  const qc = useQueryClient()
  const list = (params?: any) => useQuery({ queryKey: ['productos', params], queryFn: async () => (await api.get('/productos', { params })).data })
  const get = (id: string) => useQuery({ queryKey: ['producto', id], queryFn: async () => (await api.get(`/productos/${id}`)).data })
  const create = useMutation({ mutationFn: async (dto: any) => (await api.post('/productos', dto)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }) })
  const update = useMutation({ mutationFn: async ({ id, dto }: { id: string; dto: any }) => (await api.patch(`/productos/${id}`, dto)).data, onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['productos'] }); qc.invalidateQueries({ queryKey: ['producto', v.id] }) } })
  const remove = useMutation({ mutationFn: async (id: string) => (await api.delete(`/productos/${id}`)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }) })
  return { list, get, create, update, remove }
}
