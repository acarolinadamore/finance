import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCalendarEvents, useCreateCalendarEvent, useDeleteCalendarEvent } from '@/hooks/useCalendarEvents';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Plus, Clock } from 'lucide-react';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
}

export function EventDialog({ open, onOpenChange, date }: EventDialogProps) {
  const [eventTime, setEventTime] = useState(() => {
    const now = new Date();
    return format(now, 'HH:mm');
  });
  const [description, setDescription] = useState('');

  const { data: allEvents = [] } = useCalendarEvents();
  const createMutation = useCreateCalendarEvent();
  const deleteMutation = useDeleteCalendarEvent();

  const dayEvents = useMemo(() => {
    return allEvents
      .filter(event => {
        const eventDate = format(new Date(event.event_date), 'yyyy-MM-dd');
        return eventDate === date;
      })
      .sort((a, b) => a.event_time.localeCompare(b.event_time));
  }, [allEvents, date]);

  const formattedDate = date
    ? format(new Date(date + 'T12:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })
    : '';

  const handleCreate = async () => {
    if (!description.trim()) {
      return;
    }

    await createMutation.mutateAsync({
      event_date: date,
      event_time: eventTime,
      description: description.trim(),
    });

    setDescription('');
    setEventTime(format(new Date(), 'HH:mm'));
  };

  const handleDelete = async (eventId: string) => {
    await deleteMutation.mutateAsync(eventId);
  };

  const handleClose = () => {
    setDescription('');
    setEventTime(format(new Date(), 'HH:mm'));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Eventos do Dia</DialogTitle>
          <DialogDescription className="capitalize">{formattedDate}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6 mt-4">
          {dayEvents.length > 0 && (
            <div className="border rounded-lg">
              <ScrollArea className="max-h-[250px]">
                <div className="p-4 space-y-3">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-primary min-w-[60px]">
                        <Clock className="h-4 w-4" />
                        {event.event_time.slice(0, 5)}
                      </div>
                      <p className="flex-1 text-sm">{event.description}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Adicionar Novo Evento
            </h3>

            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="event-time" className="text-sm font-medium">Horário</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="event-description" className="text-sm font-medium">Descrição do Evento</Label>
                <Textarea
                  id="event-description"
                  placeholder="Digite o evento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleCreate();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Pressione Ctrl+Enter para adicionar rapidamente
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-6 border-t mt-4">
          <Button variant="outline" onClick={handleClose} className="min-w-[100px]">
            Fechar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!description.trim() || createMutation.isPending}
            className="min-w-[150px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Evento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
