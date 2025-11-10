import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Archive, Trash2 } from 'lucide-react';
import { Habit } from '@/types/routine';
import { eachDayOfInterval, startOfMonth, endOfMonth, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HabitGridProps {
  habits: Habit[];
  currentMonth: Date;
  isCompleted: (habitId: string, date: string) => boolean;
  isExpectedDay: (habit: Habit, date: string) => boolean;
  onToggle: (habitId: string, date: string) => void;
  onEdit: (habit: Habit) => void;
  onArchive: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  habitMetrics: Record<string, { progress: number; currentStreak: number; bestStreak: number }>;
  onQuickAction?: (habitId: string, action: 'week' | 'clear-week' | 'month') => void;
}

export const HabitGrid = ({
  habits,
  currentMonth,
  isCompleted,
  isExpectedDay,
  onToggle,
  onEdit,
  onArchive,
  onDelete,
  habitMetrics,
}: HabitGridProps) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = new Date();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Cabeçalho com dias do mês */}
        <div className="flex border-b sticky top-0 bg-background z-10">
          {/* Coluna de nomes (fixa) */}
          <div className="w-56 flex-shrink-0 p-4 font-bold text-lg border-r">
            Meus Hábitos
          </div>

          {/* Dias do mês */}
          <div className="flex flex-1">
            {daysInMonth.map((day) => {
              const dayNum = format(day, 'd');
              const dayOfWeek = format(day, 'EEEEE', { locale: ptBR }); // S, T, Q, Q, S, S, D
              const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

              return (
                <div
                  key={day.toISOString()}
                  className={`flex-1 min-w-[44px] px-2 py-2 text-center flex flex-col items-center justify-center ${
                    isToday ? 'bg-primary/10 text-primary' : 'text-foreground'
                  }`}
                >
                  <div className="text-sm font-bold">{dayNum}</div>
                  <div className="text-xs text-muted-foreground font-medium">{dayOfWeek}</div>
                </div>
              );
            })}
          </div>

          {/* Coluna de métricas */}
          <div className="w-32 flex-shrink-0 p-4 font-bold text-center border-l">
            %
          </div>
        </div>

        {/* Linhas de hábitos */}
        {habits.length === 0 ? (
          <div className="flex border-b bg-muted/20">
            <div className="w-56 flex-shrink-0 p-4 border-r text-center">
              <p className="text-muted-foreground text-sm italic">Nenhum hábito cadastrado</p>
            </div>
            <div className="flex flex-1">
              {daysInMonth.map((day) => (
                <div key={day.toISOString()} className="flex-1 min-w-[44px] px-2 py-3" />
              ))}
            </div>
            <div className="w-32 flex-shrink-0 p-4 border-l" />
          </div>
        ) : (
          habits.map((habit) => {
          const metrics = habitMetrics[habit.id] || { progress: 0, currentStreak: 0, bestStreak: 0 };
          const { progress, currentStreak, bestStreak } = metrics;

          return (
            <div
              key={habit.id}
              className="flex border-b hover:bg-muted/30 transition-colors"
            >
              {/* Nome do hábito */}
              <div className="w-56 flex-shrink-0 p-4 border-r flex items-center justify-between group">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {habit.icon && (
                    <span className="text-xl flex-shrink-0">{habit.icon}</span>
                  )}
                  <span className="truncate font-medium">{habit.name}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-100 hover:bg-muted flex-shrink-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(habit)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar Hábito
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onArchive(habit.id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Arquivar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(habit.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Permanentemente
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Células dos dias */}
              <div className="flex flex-1">
                {daysInMonth.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const completed = isCompleted(habit.id, dateStr);
                  const isFuture = day > today;

                  return (
                    <div
                      key={dateStr}
                      className="flex-1 min-w-[44px] px-2 py-3 flex items-center justify-center"
                    >
                      <div
                        className={`
                          w-7 h-7 rounded-full flex-shrink-0
                          ${completed ? 'bg-green-500 cursor-pointer' : 'border-2 border-gray-400 cursor-pointer bg-white'}
                          ${isFuture ? 'opacity-30 pointer-events-none' : ''}
                        `}
                        onClick={() => onToggle(habit.id, dateStr)}
                        title={completed ? 'Cumprido' : 'Marcar'}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Métricas */}
              <div className="w-32 flex-shrink-0 p-4 border-l flex flex-col items-center justify-center">
                <div className="text-xl font-bold text-primary">{progress}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  🔥 {currentStreak}d
                </div>
                {bestStreak > currentStreak && (
                  <div className="text-xs text-muted-foreground">
                    🏆 {bestStreak}d
                  </div>
                )}
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
};
