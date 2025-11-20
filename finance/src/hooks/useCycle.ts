import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCycleSettings,
  upsertCycleSettings,
  fetchCycleRecords,
  fetchCycleRecordByDate,
  upsertCycleRecord,
  updateCycleRecord,
  deleteCycleRecord,
  fetchCycleStats,
  type ApiCycleSettings,
  type ApiCycleRecord,
} from '@/services/api';
import { toast } from 'sonner';

export function useCycleSettings() {
  return useQuery({
    queryKey: ['cycle-settings'],
    queryFn: fetchCycleSettings,
    staleTime: 1000 * 60 * 30,
    retry: false,
  });
}

export function useUpsertCycleSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertCycleSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-settings'] });
      queryClient.invalidateQueries({ queryKey: ['cycle-stats'] });
      toast.success('Configurações salvas!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar configurações: ${error.message}`);
    },
  });
}

export function useCycleRecords(params?: {
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: ['cycle-records', params],
    queryFn: () => fetchCycleRecords(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCycleRecordByDate(date: string) {
  return useQuery({
    queryKey: ['cycle-record', date],
    queryFn: () => fetchCycleRecordByDate(date),
    enabled: !!date,
    retry: false,
  });
}

export function useUpsertCycleRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertCycleRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-records'] });
      queryClient.invalidateQueries({ queryKey: ['cycle-record'] });
      queryClient.invalidateQueries({ queryKey: ['cycle-stats'] });
      toast.success('Registro salvo!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar registro: ${error.message}`);
    },
  });
}

export function useUpdateCycleRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, data }: { date: string; data: Partial<ApiCycleRecord> }) =>
      updateCycleRecord(date, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-records'] });
      queryClient.invalidateQueries({ queryKey: ['cycle-record'] });
      queryClient.invalidateQueries({ queryKey: ['cycle-stats'] });
      toast.success('Registro atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar registro: ${error.message}`);
    },
  });
}

export function useDeleteCycleRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCycleRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-records'] });
      queryClient.invalidateQueries({ queryKey: ['cycle-record'] });
      queryClient.invalidateQueries({ queryKey: ['cycle-stats'] });
      toast.success('Registro excluído!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir registro: ${error.message}`);
    },
  });
}

export function useCycleStats() {
  return useQuery({
    queryKey: ['cycle-stats'],
    queryFn: fetchCycleStats,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
