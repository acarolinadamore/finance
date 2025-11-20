import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  type ApiCalendarEvent,
  type ApiCreateCalendarEvent,
} from '@/services/api';
import { toast } from 'sonner';

export function useCalendarEvents(params?: {
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: ['calendar-events', params],
    queryFn: () => fetchCalendarEvents(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Evento criado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar evento: ${error.message}`);
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Evento deletado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao deletar evento: ${error.message}`);
    },
  });
}
