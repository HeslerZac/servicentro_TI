import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useVehiculos() {
  const qc = useQueryClient()
  const list = (params?: any) => useQuery({ queryKey: ['vehiculos', params], queryFn: async () => (await api.get('/vehiculos', { params })).data })
  const get = (id: string) => useQuery({ queryKey: ['vehiculo', id], queryFn: async () => (await api.get(`/vehiculos/${id}`)).data })
  const create = useMutation({ mutationFn: async (dto: any) => (await api.post('/vehiculos', dto)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['vehiculos'] }) })
  const update = useMutation({ mutationFn: async ({ id, dto }: { id: string; dto: any }) => (await api.patch(`/vehiculos/${id}`, dto)).data, onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['vehiculos'] }); qc.invalidateQueries({ queryKey: ['vehiculo', v.id] }) } })
  const remove = useMutation({ mutationFn: async (id: string) => (await api.delete(`/vehiculos/${id}`)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['vehiculos'] }) })
  return { list, get, create, update, remove }
}
