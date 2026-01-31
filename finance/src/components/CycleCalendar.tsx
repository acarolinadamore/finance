import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  format,
  isSameMonth,
  isSameDay,
  addDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateCalendarWithPhases, type CycleSettings } from '@/lib/cyclePhases';
import { useCycleSettings, useCycleStats, useCycleRecords } from '@/hooks/useCycle';
import { CycleLegend } from './CycleLegend';
import { FLOW_LABELS } from '@/types/cycle';

const FLOW_ICONS = {
  none: '',
  light: '🩸',
  moderate: '🩸🩸',
  heavy: '🩸🩸🩸',
};

export function CycleCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: settings } = useCycleSettings();
  const { data: stats } = useCycleStats();

  // Buscar registros reais para o mês visível
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const { data: records } = useCycleRecords({
    start_date: format(calendarStart, 'yyyy-MM-dd'),
    end_date: format(calendarEnd, 'yyyy-MM-dd'),
  });

  // Criar map de registros reais por data
  const recordsByDate = useMemo(() => {
    if (!records) return new Map();

    const map = new Map();
    records.forEach((record: any) => {
      // Normalizar a data para formato yyyy-MM-dd
      const normalizedDate = format(new Date(record.record_date), 'yyyy-MM-dd');
      map.set(normalizedDate, record);
    });
    return map;
  }, [records]);

  // Detectar inícios de menstruação (fluxo moderate/heavy que inicia novo ciclo)
  const periodStartDates = useMemo(() => {
    if (!records) return [];

    const starts: Date[] = [];
    const sortedRecords = [...records].sort((a: any, b: any) =>
      new Date(a.record_date).getTime() - new Date(b.record_date).getTime()
    );

    sortedRecords.forEach((record: any, index: number) => {
      const flowLevel = record.flow_level;
      const isHeavyFlow = flowLevel === 'moderate' || flowLevel === 'heavy';

      if (isHeavyFlow) {
        // Verificar se é início de novo ciclo (não há fluxo nos 3 dias anteriores)
        const recordDate = new Date(record.record_date);
        const threeDaysBefore = addDays(recordDate, -3);

        let hasFlowBefore = false;
        for (let i = index - 1; i >= 0; i--) {
          const prevRecord = sortedRecords[i];
          const prevDate = new Date(prevRecord.record_date);

          if (prevDate < threeDaysBefore) break;

          if (prevRecord.flow_level !== 'none') {
            hasFlowBefore = true;
            break;
          }
        }

        if (!hasFlowBefore) {
          starts.push(recordDate);
        }
      }
    });

    return starts;
  }, [records]);

  const calendarDays = useMemo(() => {
    if (!settings) return [];

    const cycleSettings: CycleSettings = {
      last_period_start_date: settings.last_period_start_date,
      average_cycle_length: settings.average_cycle_length,
      average_period_length: settings.average_period_length,
    };

    // Passar as datas de início de menstruação para o cálculo
    const days = generateCalendarWithPhases(
      calendarStart,
      calendarEnd,
      cycleSettings,
      periodStartDates.length > 0 ? periodStartDates : undefined
    );

    // Adicionar informação de registro real a cada dia
    return days.map(day => {
      const dateStr = format(day.date, 'yyyy-MM-dd');
      const record = recordsByDate.get(dateStr);
      return {
        ...day,
        hasRecord: !!record,
        flowLevel: record?.flow_level || 'none',
      };
    });
  }, [currentMonth, settings, recordsByDate, calendarStart, calendarEnd, periodStartDates]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  if (!settings) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Configure suas informações primeiro para ver o calendário do ciclo.
          </p>
        </CardContent>
      </Card>
    );
  }

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Cabeçalho dos dias da semana */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}

            {/* Células do calendário */}
            {calendarDays.map((dayInfo, index) => {
              const isCurrentMonth = isSameMonth(dayInfo.date, currentMonth);
              const isToday = isSameDay(dayInfo.date, today);
              const phase = dayInfo.phase;
              const hasRecord = dayInfo.hasRecord;
              const hasFlow = hasRecord && dayInfo.flowLevel !== 'none';

              // Determinar estilo baseado em registro real vs previsão
              // SEMPRE mostrar cor se houver fase (previsão ou confirmado)
              const bgColor = phase ? phase.bgColor : 'transparent';

              const borderStyle = hasFlow && phase
                ? `2px solid ${phase.color}` // Borda colorida APENAS para registro confirmado
                : 'none';

              return (
                <div
                  key={index}
                  className={`
                    aspect-square p-2 rounded-lg transition-all relative
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                    ${isToday ? 'ring-2 ring-blue-500 font-bold' : ''}
                  `}
                  style={{
                    backgroundColor: bgColor,
                    border: borderStyle,
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span
                      className={`text-sm ${isToday ? 'font-bold' : ''}`}
                      style={{
                        color: phase ? phase.textColor : 'inherit',
                      }}
                    >
                      {format(dayInfo.date, 'd')}
                    </span>

                    {/* Gotinhas de sangue de acordo com o nível de fluxo */}
                    {hasFlow && (
                      <span
                        className="text-xs leading-none mt-0.5"
                        title={`Fluxo registrado: ${FLOW_LABELS[dayInfo.flowLevel as keyof typeof FLOW_LABELS]}`}
                      >
                        {FLOW_ICONS[dayInfo.flowLevel as keyof typeof FLOW_ICONS]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Card de próxima menstruação */}
          <div className="mt-4 pt-4 border-t">
            {stats && stats.nextPeriodDate && (
              <Card className="mb-3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Menstruação Prevista</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400 capitalize">
                    {format(new Date(stats.nextPeriodDate + 'T12:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </div>
                  <p className="text-sm font-medium mt-1">
                    Faltam {stats.daysUntilNextPeriod} {stats.daysUntilNextPeriod === 1 ? 'dia' : 'dias'}
                  </p>
                  {stats.hasRealData && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Baseado em {stats.calculatedCycleLength} dias de ciclo médio calculado
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Legenda de intensidade do fluxo */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Intensidade do Fluxo</h4>
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-6 px-2 rounded bg-red-100 flex items-center justify-center">
                    <span className="text-xs whitespace-nowrap">🩸</span>
                  </div>
                  <span className="text-muted-foreground">Leve</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 px-2 rounded bg-red-100 flex items-center justify-center">
                    <span className="text-xs whitespace-nowrap">🩸🩸</span>
                  </div>
                  <span className="text-muted-foreground">Moderado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 px-2 rounded bg-red-100 flex items-center justify-center">
                    <span className="text-xs whitespace-nowrap">🩸🩸🩸</span>
                  </div>
                  <span className="text-muted-foreground">Intenso</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legenda detalhada */}
      <CycleLegend />
    </div>
  );
}
