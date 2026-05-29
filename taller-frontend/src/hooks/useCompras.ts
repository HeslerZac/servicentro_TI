import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useCompras() {
  const qc = useQueryClient();
  const create = useMutation({ mutationFn: async (dto: any) => (await api.post('/compras', dto)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['compras'] }) });
  return { create };
}
