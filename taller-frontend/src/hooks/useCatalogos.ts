import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useCatalogos() {
  const qc = useQueryClient()
  const categorias = (params?: any) => useQuery({ queryKey: ['categorias', params], queryFn: async () => (await api.get('/catalogos/categorias', { params })).data })
  const marcas = (params?: any) => useQuery({ queryKey: ['marcas', params], queryFn: async () => (await api.get('/catalogos/marcas', { params })).data })
  const crearCategoria = useMutation({ mutationFn: async (dto: any) => (await api.post('/catalogos/categorias', dto)).data, onSuccess: ()=>qc.invalidateQueries({ queryKey: ['categorias'] }) })
  const crearMarca = useMutation({ mutationFn: async (dto: any) => (await api.post('/catalogos/marcas', dto)).data, onSuccess: ()=>qc.invalidateQueries({ queryKey: ['marcas'] }) })
  const actualizarCategoria = useMutation({ mutationFn: async ({ id, dto }: any) => (await api.patch(`/catalogos/categorias/${id}`, dto)).data, onSuccess: ()=>qc.invalidateQueries({ queryKey: ['categorias'] }) })
  const actualizarMarca = useMutation({ mutationFn: async ({ id, dto }: any) => (await api.patch(`/catalogos/marcas/${id}`, dto)).data, onSuccess: ()=>qc.invalidateQueries({ queryKey: ['marcas'] }) })
  const marcasPorCategoria = (id: string) => useQuery({ queryKey: ['categorias', id, 'marcas'], queryFn: async () => (await api.get(`/catalogos/categorias/${id}/marcas`)).data })
  const asignarMarcas = useMutation({ mutationFn: async ({ id, marcas }: { id: string; marcas: string[] }) => (await api.post(`/catalogos/categorias/${id}/marcas`, { marcas })).data, onSuccess: (_d, v)=>qc.invalidateQueries({ queryKey: ['categorias', v.id, 'marcas'] }) })
  return { categorias, marcas, crearCategoria, crearMarca, actualizarCategoria, actualizarMarca, marcasPorCategoria, asignarMarcas }
}
