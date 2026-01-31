import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarDay } from '@/components/CalendarDay';
import { CalendarSettingsDialog } from '@/components/CalendarSettingsDialog';
import { EventDialog } from '@/components/EventDialog';
import { PageHeader } from '@/components/PageHeader';
import { useCycleRecords, useCycleSettings } from '@/hooks/useCycle';
import { useMoods } from '@/hooks/useApiMoods';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCronogramaEtapas } from '@/hooks/useCronogramas';
import { EMOTIONS } from '@/types/routine';
import { calculatePhaseForDate, PHASE_INFO } from '@/lib/cyclePhases';
import type { PhaseInfo, CyclePhase } from '@/lib/cyclePhases';
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
  cyclePhase?: PhaseInfo | null;
  cronogramaEtapas?: Array<{ id: number; nome: string; cor: string; cronograma_titulo?: string }>;
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

  const { data: cronogramaEtapas = [] } = useCronogramaEtapas();
  const { data: cycleSettings } = useCycleSettings();

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

    // Add cycle phases to each day
    if (cycleSettings) {
      calendarDays.forEach(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const phase = calculatePhaseForDate(day, cycleSettings);
        map.set(dateKey, {
          ...map.get(dateKey),
          cyclePhase: phase,
        });
      });
    }

    // Add cronograma etapas to each day
    calendarDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const etapasNesteDia = cronogramaEtapas.filter(etapa => {
        const etapaStart = new Date(etapa.data_inicio);
        const etapaEnd = new Date(etapa.data_termino);
        return day >= etapaStart && day <= etapaEnd;
      });

      if (etapasNesteDia.length > 0) {
        map.set(dateKey, {
          ...map.get(dateKey),
          cronogramaEtapas: etapasNesteDia.map(e => ({
            id: e.id,
            nome: e.nome,
            cor: e.cor,
            cronograma_titulo: e.cronograma_titulo,
          })),
        });
      }
    });

    return map;
  }, [cycleRecords, moods, events, cronogramaEtapas, cycleSettings, calendarDays]);

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
      <PageHeader
        title="Calendário"
        actions={
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            title="Configurações"
          >
            <Settings className="h-5 w-5" />
          </Button>
        }
      />
      <main className="container mx-auto px-4 py-6 max-w-7xl">

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

            {/* Legendas */}
            <div className="mt-6 space-y-6">
              {/* 1. Legenda de Projetos do Cronograma */}
              {visibleModules.includes('cronograma') && cronogramaEtapas.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Projetos visíveis neste mês:</h3>
                  <div className="flex flex-wrap gap-3">
                    {cronogramaEtapas
                      .filter((etapa) => {
                        const etapaStart = new Date(etapa.data_inicio);
                        const etapaEnd = new Date(etapa.data_termino);
                        return (etapaStart <= calendarEnd && etapaEnd >= calendarStart);
                      })
                      .map((etapa) => (
                        <div key={etapa.id} className="flex items-center gap-2 text-sm">
                          <div
                            className="w-4 h-1 rounded-full"
                            style={{ backgroundColor: etapa.cor }}
                          />
                          <span className="font-medium">{etapa.nome}</span>
                          <span className="text-muted-foreground">({etapa.cronograma_titulo})</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 2. Legendas do Ciclo Feminino */}
              {visibleModules.includes('cycle') && cycleSettings && (
                <>
                  {/* Intensidade do Fluxo */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Intensidade do fluxo:</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🩸</span>
                        <span className="text-xs">Leve</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🩸🩸</span>
                        <span className="text-xs">Moderado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🩸🩸🩸</span>
                        <span className="text-xs">Intenso</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Entenda as Fases do Ciclo - Versão Completa */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-base">Entenda as Fases do Ciclo</h3>
                    <div className="space-y-4">
                      {(['menstrual', 'follicular', 'ovulatory', 'luteal_early', 'luteal_late'] as CyclePhase[]).map((phaseKey) => {
                        const phase = PHASE_INFO[phaseKey];
                        return (
                          <div key={phaseKey} className="space-y-2 border-l-4 pl-4" style={{ borderColor: phase.color }}>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-6 h-6 rounded-full flex-shrink-0 border-2"
                                style={{
                                  backgroundColor: phase.bgColor,
                                  borderColor: phase.color,
                                }}
                              />
                              <h4 className="font-semibold text-sm">
                                {phase.name} <span className="text-muted-foreground font-normal">({phase.durationDays} {phase.durationDays === 1 ? 'dia' : 'dias'})</span>
                              </h4>
                            </div>

                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="font-medium text-muted-foreground">O que acontece: </span>
                                <span className="text-foreground">{phase.description}</span>
                              </div>

                              <div>
                                <span className="font-medium text-muted-foreground">Humor: </span>
                                <span className="text-foreground">{phase.mood}</span>
                              </div>

                              <div>
                                <span className="font-medium text-muted-foreground">Necessidades: </span>
                                <span className="text-foreground">{phase.needs}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
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
