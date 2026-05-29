import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useClientes() {
  const qc = useQueryClient()
  const list = (params?: any) => useQuery({ queryKey: ['clientes', params], queryFn: async () => (await api.get('/clientes', { params })).data })
  const get = (id: string) => useQuery({ queryKey: ['cliente', id], queryFn: async () => (await api.get(`/clientes/${id}`)).data })
  const create = useMutation({ mutationFn: async (dto: any) => (await api.post('/clientes', dto)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }) })
  const update = useMutation({ mutationFn: async ({ id, dto }: { id: string; dto: any }) => (await api.patch(`/clientes/${id}`, dto)).data, onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['clientes'] }); qc.invalidateQueries({ queryKey: ['cliente', v.id] }) } })
  const remove = useMutation({ mutationFn: async (id: string) => (await api.delete(`/clientes/${id}`)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }) })
  return { list, get, create, update, remove }
}
