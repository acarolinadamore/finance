import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMeetingTags,
  createMeetingTag,
  updateMeetingTag,
  deleteMeetingTag,
  fetchMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  type ApiMeetingTag,
  type ApiMeeting,
} from '@/services/api';
import { toast } from '@/hooks/use-toast';

// Meeting Tags Hooks
export function useMeetingTags() {
  return useQuery({
    queryKey: ['meeting-tags'],
    queryFn: fetchMeetingTags,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    retryDelay: 500,
  });
}

export function useCreateMeetingTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMeetingTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-tags'] });
      toast({
        title: 'Tag criada com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar tag',
        description: error.message || 'Não foi possível criar a tag',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateMeetingTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; color: string } }) =>
      updateMeetingTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-tags'] });
      toast({
        title: 'Tag atualizada com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar tag',
        description: error.message || 'Não foi possível atualizar a tag',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteMeetingTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMeetingTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-tags'] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: 'Tag excluída com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir tag',
        description: error.message || 'Não foi possível excluir a tag',
        variant: 'destructive',
      });
    },
  });
}

// Meetings Hooks
export function useMeetings() {
  return useQuery({
    queryKey: ['meetings'],
    queryFn: fetchMeetings,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    retryDelay: 500,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: 'Reunião criada com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar reunião',
        description: error.message || 'Não foi possível criar a reunião',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ApiMeeting> }) =>
      updateMeeting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: 'Reunião atualizada com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar reunião',
        description: error.message || 'Não foi possível atualizar a reunião',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: 'Reunião excluída com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir reunião',
        description: error.message || 'Não foi possível excluir a reunião',
        variant: 'destructive',
      });
    },
  });
}
