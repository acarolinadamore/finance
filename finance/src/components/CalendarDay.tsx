import { cn } from '@/lib/utils';
import type { FlowLevel } from '@/types/cycle';

interface DayEvent {
  id: string;
  event_time: string;
  description: string;
}

interface CalendarDayData {
  cycleFlow?: FlowLevel;
  hasRoutines?: boolean;
  moodEmojis?: string[];
  hasMeals?: boolean;
  events?: DayEvent[];
}

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  data?: CalendarDayData;
  visibleModules: string[];
  onClick?: () => void;
}

const FLOW_DROPS: Record<FlowLevel, string> = {
  none: '',
  light: '🩸',
  moderate: '🩸🩸',
  heavy: '🩸🩸🩸',
};

export function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  data,
  visibleModules,
  onClick,
}: CalendarDayProps) {
  const dayNumber = date.getDate();

  const showCycle = visibleModules.includes('cycle') && data?.cycleFlow && data.cycleFlow !== 'none';
  const showMoods = visibleModules.includes('moods') && data?.moodEmojis && data.moodEmojis.length > 0;
  const events = data?.events || [];

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative aspect-square p-1.5 border border-border rounded-lg transition-all',
        'hover:bg-muted/50 hover:shadow-sm cursor-pointer',
        'flex flex-col gap-0.5 overflow-hidden items-start',
        !isCurrentMonth && 'opacity-40',
        isToday && 'ring-2 ring-primary ring-offset-1'
      )}
    >
      <span
        className={cn(
          'text-sm font-medium self-start',
          isToday && 'text-primary font-bold'
        )}
      >
        {dayNumber}
      </span>

      {events.length > 0 && (
        <div className="flex-1 flex flex-col gap-0.5 w-full overflow-hidden items-start">
          {events.slice(0, 2).map((event) => (
            <div
              key={event.id}
              className="flex flex-row items-center gap-1 px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 w-full"
              title={`${event.event_time.slice(0, 5)} - ${event.description}`}
            >
              <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-400 leading-tight whitespace-nowrap">
                {event.event_time.slice(0, 5)}
              </span>
              <span className="text-[8px] text-amber-600 dark:text-amber-500 leading-tight truncate">
                {truncateText(event.description, 12)}
              </span>
            </div>
          ))}
          {events.length > 2 && (
            <span className="text-[8px] text-muted-foreground">
              +{events.length - 2}
            </span>
          )}
        </div>
      )}

      {showMoods && (
        <div className="absolute bottom-1 left-1 flex flex-wrap gap-0.5 max-w-[40%]">
          {data!.moodEmojis!.slice(0, 3).map((emoji, index) => (
            <span
              key={index}
              className="text-xs leading-none"
              title="Humor"
            >
              {emoji}
            </span>
          ))}
        </div>
      )}

      {showCycle && (
        <div className="absolute bottom-1 right-1">
          <span
            className="text-xs leading-none"
            title="Ciclo Feminino"
          >
            {FLOW_DROPS[data!.cycleFlow!]}
          </span>
        </div>
      )}
    </button>
  );
}
