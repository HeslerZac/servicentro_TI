import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useUsuarios() {
  const qc = useQueryClient()
  const list = (params?: any) => useQuery({ queryKey: ['usuarios', params], queryFn: async () => (await api.get('/usuarios', { params })).data })
  const get = (id: string) => api.get(`/usuarios/${id}`)
  const create = useMutation({ mutationFn: async (dto: any) => (await api.post('/usuarios', dto)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }) })
  const update = useMutation({ mutationFn: async ({ id, dto }: any) => (await api.patch(`/usuarios/${id}`, dto)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }) })
  const cambiarRol = useMutation({ mutationFn: async ({ id, rol }: any) => (await api.patch(`/usuarios/${id}/rol`, { rol })).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }) })
  const cambiarEstado = useMutation({ mutationFn: async ({ id, estaActivo }: any) => (await api.patch(`/usuarios/${id}/estado`, { estaActivo })).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }) })
  const resetPassword = useMutation({ mutationFn: async ({ id, contrasena }: any) => (await api.patch(`/usuarios/${id}/contrasena`, { contrasena })).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }) })
  const changePassword = useMutation({ mutationFn: async (dto: any) => (await api.patch(`/usuarios/password`, dto)).data })
  return { list, get, create, update, cambiarRol, cambiarEstado, resetPassword, changePassword }
}
