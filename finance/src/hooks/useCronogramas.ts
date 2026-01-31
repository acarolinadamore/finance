import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCronogramas,
  fetchCronograma,
  createCronograma,
  updateCronograma,
  deleteCronograma,
  fetchCronogramaEtapas,
  fetchEtapasByCronograma,
  createCronogramaEtapa,
  updateCronogramaEtapa,
  deleteCronogramaEtapa,
  type ApiCronograma,
  type ApiCronogramaEtapa,
} from '@/services/api';
import { toast } from 'sonner';

// ==================== CRONOGRAMAS ====================

export function useCronogramas() {
  return useQuery({
    queryKey: ['cronogramas'],
    queryFn: fetchCronogramas,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCronograma(id: number) {
  return useQuery({
    queryKey: ['cronogramas', id],
    queryFn: () => fetchCronograma(id),
    enabled: !!id,
  });
}

export function useCreateCronograma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCronograma,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronogramas'] });
      toast.success('Cronograma criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar cronograma: ${error.message}`);
    },
  });
}

export function useUpdateCronograma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ApiCronograma> }) =>
      updateCronograma(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cronogramas'] });
      queryClient.invalidateQueries({ queryKey: ['cronogramas', variables.id] });
      toast.success('Cronograma atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar cronograma: ${error.message}`);
    },
  });
}

export function useDeleteCronograma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCronograma,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronogramas'] });
      toast.success('Cronograma excluído!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir cronograma: ${error.message}`);
    },
  });
}

// ==================== ETAPAS ====================

export function useCronogramaEtapas(params?: {
  data_inicio?: string;
  data_termino?: string;
}) {
  return useQuery({
    queryKey: ['cronograma-etapas', params],
    queryFn: () => fetchCronogramaEtapas(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useEtapasByCronograma(cronogramaId: number) {
  return useQuery({
    queryKey: ['cronogramas', cronogramaId, 'etapas'],
    queryFn: () => fetchEtapasByCronograma(cronogramaId),
    enabled: !!cronogramaId,
  });
}

export function useCreateCronogramaEtapa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cronogramaId, data }: { cronogramaId: number; data: Omit<ApiCronogramaEtapa, 'id' | 'cronograma_id' | 'created_at' | 'updated_at' | 'cronograma_titulo' | 'cronograma_status'> }) =>
      createCronogramaEtapa(cronogramaId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cronogramas'] });
      queryClient.invalidateQueries({ queryKey: ['cronogramas', variables.cronogramaId] });
      queryClient.invalidateQueries({ queryKey: ['cronogramas', variables.cronogramaId, 'etapas'] });
      queryClient.invalidateQueries({ queryKey: ['cronograma-etapas'] });
      toast.success('Etapa criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar etapa: ${error.message}`);
    },
  });
}

export function useUpdateCronogramaEtapa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ApiCronogramaEtapa> }) =>
      updateCronogramaEtapa(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronogramas'] });
      queryClient.invalidateQueries({ queryKey: ['cronograma-etapas'] });
      toast.success('Etapa atualizada!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar etapa: ${error.message}`);
    },
  });
}

export function useDeleteCronogramaEtapa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCronogramaEtapa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronogramas'] });
      queryClient.invalidateQueries({ queryKey: ['cronograma-etapas'] });
      toast.success('Etapa excluída!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir etapa: ${error.message}`);
    },
  });
}
