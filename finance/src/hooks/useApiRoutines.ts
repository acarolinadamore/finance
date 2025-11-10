import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRoutines,
  fetchRoutineCompletions,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  toggleRoutineCompletion,
  type ApiRoutine,
  type ApiRoutineCompletion
} from '@/services/api';
import { toast } from 'sonner';

export function useRoutines() {
  return useQuery({
    queryKey: ['routines'],
    queryFn: fetchRoutines,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRoutineCompletions(params?: {
  routine_id?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: ['routine-completions', params],
    queryFn: () => fetchRoutineCompletions(params),
    staleTime: 1000 * 60,
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      toast.success('Rotina criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar rotina: ${error.message}`);
    },
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApiRoutine> }) =>
      updateRoutine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      toast.success('Rotina atualizada!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar rotina: ${error.message}`);
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      toast.success('Rotina excluída!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir rotina: ${error.message}`);
    },
  });
}

export function useToggleRoutineCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleRoutineCompletion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-completions'] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao marcar rotina: ${error.message}`);
    },
  });
}
