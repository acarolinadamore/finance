import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchHabits,
  fetchHabitCompletions,
  createHabit,
  updateHabit,
  archiveHabit,
  unarchiveHabit,
  deleteHabit,
  toggleHabitCompletion,
  type ApiHabit,
  type ApiHabitCompletion
} from '@/services/api';
import { toast } from 'sonner';

export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: fetchHabits,
    staleTime: 1000 * 60 * 5,
  });
}

export function useHabitCompletions(params?: {
  habit_id?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: ['habit-completions', params],
    queryFn: () => fetchHabitCompletions(params),
    staleTime: 1000 * 60,
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Hábito criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar hábito: ${error.message}`);
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApiHabit> }) =>
      updateHabit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Hábito atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar hábito: ${error.message}`);
    },
  });
}

export function useArchiveHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Hábito arquivado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao arquivar hábito: ${error.message}`);
    },
  });
}

export function useUnarchiveHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unarchiveHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Hábito restaurado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao restaurar hábito: ${error.message}`);
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Hábito excluído!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir hábito: ${error.message}`);
    },
  });
}

export function useToggleHabitCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleHabitCompletion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-completions'] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao marcar hábito: ${error.message}`);
    },
  });
}
