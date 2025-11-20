import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarDay } from '@/components/CalendarDay';
import { CalendarSettingsDialog } from '@/components/CalendarSettingsDialog';
import { EventDialog } from '@/components/EventDialog';
import { useCycleRecords } from '@/hooks/useCycle';
import { useMoods } from '@/hooks/useApiMoods';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { EMOTIONS } from '@/types/routine';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

const Calendario = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [visibleModules, setVisibleModules] = useState<string[]>(() => {
    const saved = localStorage.getItem('calendar-visible-modules');
    return saved ? JSON.parse(saved) : ['cycle', 'moods'];
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const { data: cycleRecords = [] } = useCycleRecords({
    start_date: format(calendarStart, 'yyyy-MM-dd'),
    end_date: format(calendarEnd, 'yyyy-MM-dd'),
  });

  const { data: moods = [] } = useMoods({
    start_date: format(calendarStart, 'yyyy-MM-dd'),
    end_date: format(calendarEnd, 'yyyy-MM-dd'),
  });

  const { data: events = [] } = useCalendarEvents({
    start_date: format(calendarStart, 'yyyy-MM-dd'),
    end_date: format(calendarEnd, 'yyyy-MM-dd'),
  });

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  const dayDataMap = useMemo(() => {
    const map = new Map<string, CalendarDayData>();

    cycleRecords.forEach(record => {
      const dateKey = format(new Date(record.record_date), 'yyyy-MM-dd');
      map.set(dateKey, {
        ...map.get(dateKey),
        cycleFlow: record.flow_level,
      });
    });

    moods.forEach(mood => {
      const dateKey = format(new Date(mood.mood_date), 'yyyy-MM-dd');
      // Map emotion IDs to emojis
      const moodEmojis = mood.emotion_ids
        .map(emotionId => {
          const emotion = EMOTIONS.find(e => e.id === emotionId);
          return emotion?.emoji;
        })
        .filter((emoji): emoji is string => emoji !== undefined);

      map.set(dateKey, {
        ...map.get(dateKey),
        moodEmojis: moodEmojis.length > 0 ? moodEmojis : undefined,
      });
    });

    // Group events by day
    const eventsByDay = new Map<string, DayEvent[]>();
    events.forEach(event => {
      const dateKey = format(new Date(event.event_date), 'yyyy-MM-dd');
      const dayEvents = eventsByDay.get(dateKey) || [];
      dayEvents.push({
        id: event.id,
        event_time: event.event_time,
        description: event.description,
      });
      eventsByDay.set(dateKey, dayEvents);
    });

    eventsByDay.forEach((dayEvents, dateKey) => {
      // Sort events by time
      dayEvents.sort((a, b) => a.event_time.localeCompare(b.event_time));
      map.set(dateKey, {
        ...map.get(dateKey),
        events: dayEvents,
      });
    });

    return map;
  }, [cycleRecords, moods, events]);

  const handleVisibleModulesChange = (modules: string[]) => {
    setVisibleModules(modules);
    localStorage.setItem('calendar-visible-modules', JSON.stringify(modules));
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateKey);
    setEventDialogOpen(true);
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Calendário</h1>
              <p className="text-muted-foreground text-sm">
                Visualize todos os seus módulos em um só lugar
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            title="Configurações"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-2xl font-bold capitalize min-w-[200px] text-center">
                  {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                </h2>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <Button variant="outline" onClick={goToToday}>
                Hoje
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayData = dayDataMap.get(dateKey);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonthDay = isSameMonth(day, currentMonth);

                return (
                  <CalendarDay
                    key={dateKey}
                    date={day}
                    isCurrentMonth={isCurrentMonthDay}
                    isToday={isToday}
                    data={dayData}
                    visibleModules={visibleModules}
                    onClick={() => handleDayClick(day)}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>

      <CalendarSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        visibleModules={visibleModules}
        onVisibleModulesChange={handleVisibleModulesChange}
      />

      <EventDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        date={selectedDate}
      />
    </div>
  );
};

export default Calendario;
