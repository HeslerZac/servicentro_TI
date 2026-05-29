import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useVentas() {
  const list = (params?: any) => useQuery({ queryKey: ['ventas', params], queryFn: async () => (await api.get('/ventas', { params })).data })
  const get = (id: string) => useQuery({ queryKey: ['venta', id], queryFn: async () => (await api.get(`/ventas/${id}`)).data })
  return { list, get }
}

