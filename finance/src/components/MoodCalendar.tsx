import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DailyMood, EMOTIONS } from '@/types/routine';

interface MoodCalendarProps {
  moods: DailyMood[];
  onSelectDay: (date: string, mood?: DailyMood) => void;
}

export const MoodCalendar = ({ moods, onSelectDay }: MoodCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pegar o primeiro dia da semana do mês (0 = domingo, 6 = sábado)
  const firstDayOfWeek = monthStart.getDay();

  const getMoodForDate = (date: Date): DailyMood | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return moods.find((m) => m.moodDate === dateStr);
  };

  const getDayColor = (mood?: DailyMood): string => {
    if (!mood || !mood.dayRating) return 'transparent';

    const rating = mood.dayRating;
    if (rating <= 1) return '#dc2626'; // red
    if (rating === 2) return '#f97316'; // orange
    if (rating === 3) return '#f59e0b'; // amber
    if (rating === 4) return '#84cc16'; // lime
    return '#10b981'; // green
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  return (
    <div className="space-y-4">
      {/* Header com navegação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold min-w-[200px] text-center capitalize">
            {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </h3>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={handleToday}>
          Hoje
        </Button>
      </div>

      {/* Calendário */}
      <Card className="p-4">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-2">
          {/* Espaços vazios antes do primeiro dia */}
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {/* Dias do mês */}
          {daysInMonth.map((day) => {
            const mood = getMoodForDate(day);
            const dayColor = getDayColor(mood);
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDay(dateStr, mood)}
                className={`
                  relative aspect-square p-2 rounded-lg transition-all hover:scale-105
                  ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                  ${isTodayDate ? 'ring-2 ring-primary font-bold' : ''}
                  ${mood ? 'font-semibold' : ''}
                  hover:bg-muted/50
                `}
                style={{
                  backgroundColor: mood ? `${dayColor}15` : undefined,
                }}
              >
                {/* Número do dia */}
                <div className="text-sm">{format(day, 'd')}</div>

                {/* Indicador visual de humor */}
                {mood && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {mood.emotionIds.slice(0, 3).map((emotionId) => {
                      const emotion = EMOTIONS.find((e) => e.id === emotionId);
                      return emotion ? (
                        <span key={emotionId} className="text-xs">
                          {emotion.emoji}
                        </span>
                      ) : null;
                    })}
                    {mood.emotionIds.length > 3 && (
                      <span className="text-xs">+{mood.emotionIds.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Borda colorida se tiver avaliação */}
                {mood?.dayRating !== undefined && (
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      border: `2px solid ${dayColor}`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border-2 border-primary" />
          <span>Hoje</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/20 border-2 border-green-500" />
          <span>Dia registrado</span>
        </div>
      </div>
    </div>
  );
};
