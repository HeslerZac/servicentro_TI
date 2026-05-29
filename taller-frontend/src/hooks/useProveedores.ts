import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useProveedores() {
  const qc = useQueryClient();
  const list = () => useQuery({ queryKey: ['proveedores'], queryFn: async () => (await api.get('/proveedores')).data });
  const create = useMutation({ mutationFn: async (dto: any) => (await api.post('/proveedores', dto)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['proveedores'] }) });
  return { list, create };
}
