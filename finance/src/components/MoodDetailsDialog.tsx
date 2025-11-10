import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DailyMood, EMOTIONS } from '@/types/routine';
import { MoodSelector } from './MoodSelector';
import { DayRatingSlider } from './DayRatingSlider';
import { Trash2 } from 'lucide-react';

interface MoodDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  mood?: DailyMood;
  onSave: (
    date: string,
    emotionIds: string[],
    dayRating?: number,
    notes?: string
  ) => void;
  onDelete?: (date: string) => void;
}

export const MoodDetailsDialog = ({
  open,
  onOpenChange,
  date,
  mood,
  onSave,
  onDelete,
}: MoodDetailsDialogProps) => {
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [dayRating, setDayRating] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (mood) {
      setSelectedEmotions(mood.emotionIds);
      setDayRating(mood.dayRating ?? 3);
      setNotes(mood.notes || '');
    } else {
      setSelectedEmotions([]);
      setDayRating(3);
      setNotes('');
    }
  }, [mood, open]);

  const handleToggleEmotion = (emotionId: string) => {
    setSelectedEmotions((prev) => {
      if (prev.includes(emotionId)) {
        return prev.filter((id) => id !== emotionId);
      }
      return [...prev, emotionId];
    });
  };

  const handleSave = () => {
    onSave(date, selectedEmotions, dayRating, notes || undefined);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete && confirm('Deseja realmente excluir este registro de humor?')) {
      onDelete(date);
      onOpenChange(false);
    }
  };

  const formattedDate = format(new Date(date), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">
            {mood ? 'Editar Registro de Humor' : 'Novo Registro de Humor'}
          </DialogTitle>
          <DialogDescription className="capitalize">
            {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Emotion Selector */}
          <MoodSelector
            emotions={EMOTIONS}
            selectedEmotionIds={selectedEmotions}
            onToggleEmotion={handleToggleEmotion}
          />

          {/* Day Rating Slider */}
          <DayRatingSlider value={dayRating} onValueChange={setDayRating} />

          {/* Notes */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Observações{' '}
              <span className="text-muted-foreground">(opcional)</span>
            </p>
            <Textarea
              placeholder="Escreva sobre seu dia, o que aconteceu, como se sente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-2">
            {mood && onDelete ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Registro
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {mood ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
