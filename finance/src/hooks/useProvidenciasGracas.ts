import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProvidenciasGracas,
  fetchProvidenciaGracaCategories,
  createProvidenciaGraca,
  updateProvidenciaGraca,
  deleteProvidenciaGraca,
  type ApiProvidenciaGraca,
} from '@/services/api';
import { toast } from 'sonner';

export function useProvidenciaGracaCategories() {
  return useQuery({
    queryKey: ['providencia-graca-categories'],
    queryFn: fetchProvidenciaGracaCategories,
    staleTime: 1000 * 60 * 30,
  });
}

export function useProvidenciasGracas() {
  return useQuery({
    queryKey: ['providencias-gracas'],
    queryFn: fetchProvidenciasGracas,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateProvidenciaGraca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProvidenciaGraca,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providencias-gracas'] });
      toast.success('Providência/Graça registrada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar: ${error.message}`);
    },
  });
}

export function useUpdateProvidenciaGraca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ApiProvidenciaGraca> }) =>
      updateProvidenciaGraca(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providencias-gracas'] });
      toast.success('Registro atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
}

export function useDeleteProvidenciaGraca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProvidenciaGraca,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providencias-gracas'] });
      toast.success('Registro excluído!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });
}
