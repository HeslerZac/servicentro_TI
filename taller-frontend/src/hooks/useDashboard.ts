import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useDashboard() {
  const kpis = useQuery({ queryKey: ['dashboard','kpis'], queryFn: async () => (await api.get('/dashboard/kpis')).data })
  const ventas30 = useQuery({ queryKey: ['dashboard','ventas30'], queryFn: async () => (await api.get('/dashboard/ventas-ultimos-30-dias')).data })
  const top = useQuery({ queryKey: ['dashboard','top'], queryFn: async () => (await api.get('/dashboard/productos-mas-vendidos?limite=10&dias=30')).data })
  return { kpis, ventas30, top }
}

