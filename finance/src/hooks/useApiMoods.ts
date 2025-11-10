import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMoods,
  fetchMoodByDate,
  upsertMood,
  updateMood,
  deleteMood,
  type ApiMood
} from '@/services/api';
import { toast } from 'sonner';

export function useMoods(params?: {
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: ['moods', params],
    queryFn: () => fetchMoods(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMoodByDate(date: string) {
  return useQuery({
    queryKey: ['mood', date],
    queryFn: () => fetchMoodByDate(date),
    enabled: !!date,
    retry: false,
  });
}

export function useUpsertMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertMood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moods'] });
      queryClient.invalidateQueries({ queryKey: ['mood'] });
      toast.success('Humor registrado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar humor: ${error.message}`);
    },
  });
}

export function useUpdateMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, data }: { date: string; data: Partial<ApiMood> }) =>
      updateMood(date, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moods'] });
      queryClient.invalidateQueries({ queryKey: ['mood'] });
      toast.success('Humor atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar humor: ${error.message}`);
    },
  });
}

export function useDeleteMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moods'] });
      queryClient.invalidateQueries({ queryKey: ['mood'] });
      toast.success('Registro excluído!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir registro: ${error.message}`);
    },
  });
}
