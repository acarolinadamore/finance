import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Habit, HabitCompletion, DailyMood, Routine, RoutineCompletion } from '@/types/routine';
import { format, subDays, eachDayOfInterval, getDay } from 'date-fns';
import { TrendingUp, Calendar, Smile, Target } from 'lucide-react';

interface CombinedInsightsProps {
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  moods: DailyMood[];
  routines: Routine[];
  routineCompletions: RoutineCompletion[];
  period: 'week' | 'month';
}

const WEEK_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const CombinedInsights = ({
  habits,
  habitCompletions,
  moods,
  routines,
  routineCompletions,
  period,
}: CombinedInsightsProps) => {
  const insights = useMemo(() => {
    const today = new Date();
    const daysBack = period === 'week' ? 7 : 30;
    const startDate = subDays(today, daysBack);
    const dateRange = eachDayOfInterval({ start: startDate, end: today });

    const activeHabits = habits.filter((h) => h.isActive);
    const activeRoutines = routines.filter((r) => r.isActive);

    const results: Array<{
      icon: any;
      title: string;
      description: string;
      color: string;
    }> = [];

    // 1. Correlação Hábitos x Humor
    if (moods.length > 0 && activeHabits.length > 0) {
      let highCompletionDays = 0;
      let highCompletionMoodSum = 0;

      dateRange.forEach((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');

        // Calcular % de hábitos cumpridos
        let completed = 0;
        activeHabits.forEach((habit) => {
          const completion = habitCompletions.find(
            (c) => c.habitId === habit.id && c.completionDate === dateStr
          );
          if (completion?.completed) {
            completed++;
          }
        });

        const percentage = activeHabits.length > 0 ? (completed / activeHabits.length) * 100 : 0;

        // Se cumpriu mais de 70%
        if (percentage >= 70) {
          const mood = moods.find((m) => m.moodDate === dateStr);
          if (mood && mood.dayRating !== undefined) {
            highCompletionDays++;
            highCompletionMoodSum += mood.dayRating;
          }
        }
      });

      if (highCompletionDays > 0) {
        const averageMood = highCompletionMoodSum / highCompletionDays;
        results.push({
          icon: Smile,
          title: 'Hábitos e Humor',
          description: `Nos dias em que você concluiu mais de 70% dos hábitos, seu humor médio foi ${averageMood.toFixed(1)}/5`,
          color: '#10b981',
        });
      }
    }

    // 2. Dia da semana com menor constância
    if (activeHabits.length > 0) {
      const dayStats: Record<number, { completed: number; total: number }> = {};

      dateRange.forEach((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayOfWeek = getDay(date);

        if (!dayStats[dayOfWeek]) {
          dayStats[dayOfWeek] = { completed: 0, total: 0 };
        }

        activeHabits.forEach((habit) => {
          const completion = habitCompletions.find(
            (c) => c.habitId === habit.id && c.completionDate === dateStr
          );

          dayStats[dayOfWeek].total++;
          if (completion?.completed) {
            dayStats[dayOfWeek].completed++;
          }
        });
      });

      const dayPercentages = Object.entries(dayStats).map(([day, data]) => ({
        day: parseInt(day),
        dayName: WEEK_DAYS[parseInt(day)],
        percentage: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      }));

      const worstDay = dayPercentages.sort((a, b) => a.percentage - b.percentage)[0];

      if (worstDay && worstDay.percentage < 60) {
        results.push({
          icon: Calendar,
          title: `${worstDay.dayName} precisa de atenção`,
          description: `${worstDay.dayName}s têm menor constância em hábitos (${Math.round(worstDay.percentage)}% de conclusão)`,
          color: '#f59e0b',
        });
      }
    }

    // 3. Período mais produtivo
    if (activeRoutines.length > 0) {
      const periodStats = {
        morning: { completed: 0, total: 0 },
        afternoon: { completed: 0, total: 0 },
        night: { completed: 0, total: 0 },
      };

      dateRange.forEach((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');

        activeRoutines.forEach((routine) => {
          const completion = routineCompletions.find(
            (c) => c.routineId === routine.id && c.completionDate === dateStr
          );

          periodStats[routine.period].total++;
          if (completion?.completed) {
            periodStats[routine.period].completed++;
          }
        });
      });

      const bestPeriod = Object.entries(periodStats)
        .map(([period, data]) => ({
          period,
          percentage: data.total > 0 ? (data.completed / data.total) * 100 : 0,
        }))
        .sort((a, b) => b.percentage - a.percentage)[0];

      if (bestPeriod && bestPeriod.percentage > 70) {
        const periodName =
          bestPeriod.period === 'morning'
            ? 'manhã'
            : bestPeriod.period === 'afternoon'
            ? 'tarde'
            : 'noite';

        results.push({
          icon: TrendingUp,
          title: `Você é mais produtivo de ${periodName}`,
          description: `${Math.round(bestPeriod.percentage)}% das rotinas de ${periodName} são concluídas`,
          color: '#8b5cf6',
        });
      }
    }

    // 4. Rotina x Humor
    if (moods.length > 0 && activeRoutines.length > 0) {
      // Verificar se cumprir rotina da manhã impacta o humor
      let morningCompleteDays = 0;
      let morningMoodSum = 0;

      dateRange.forEach((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');

        const morningRoutines = activeRoutines.filter((r) => r.period === 'morning');
        const allMorningComplete = morningRoutines.every((routine) => {
          const completion = routineCompletions.find(
            (c) => c.routineId === routine.id && c.completionDate === dateStr
          );
          return completion?.completed;
        });

        if (allMorningComplete && morningRoutines.length > 0) {
          const mood = moods.find((m) => m.moodDate === dateStr);
          if (mood && mood.dayRating !== undefined) {
            morningCompleteDays++;
            morningMoodSum += mood.dayRating;
          }
        }
      });

      if (morningCompleteDays > 0) {
        const averageMood = morningMoodSum / morningCompleteDays;
        if (averageMood >= 3.5) {
          results.push({
            icon: Target,
            title: 'Manhã produtiva, dia melhor',
            description: `Quando você cumpre a rotina da manhã, seu humor médio é ${averageMood.toFixed(1)}/5`,
            color: '#06b6d4',
          });
        }
      }
    }

    // 5. Streak e motivação
    if (activeHabits.length > 0) {
      const calculateStreak = (habitId: string): number => {
        let streak = 0;
        let currentDate = new Date(today);

        while (true) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          const completion = habitCompletions.find(
            (c) => c.habitId === habitId && c.completionDate === dateStr
          );

          if (completion?.completed) {
            streak++;
            currentDate = subDays(currentDate, 1);
          } else {
            break;
          }

          if (streak > 365) break;
        }

        return streak;
      };

      const maxStreak = Math.max(
        ...activeHabits.map((h) => calculateStreak(h.id)),
        0
      );

      if (maxStreak >= 7) {
        results.push({
          icon: TrendingUp,
          title: 'Você está em sequência!',
          description: `Seu maior streak atual é de ${maxStreak} dias. Continue assim! 🔥`,
          color: '#f97316',
        });
      }
    }

    // Se não tiver insights, retornar mensagem motivacional
    if (results.length === 0) {
      results.push({
        icon: Smile,
        title: 'Continue registrando!',
        description: 'Quanto mais dados você registrar, mais insights personalizados você receberá',
        color: '#8b5cf6',
      });
    }

    return results;
  }, [habits, habitCompletions, moods, routines, routineCompletions, period]);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Insights Combinados 💡</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow"
            style={{ borderLeft: `4px solid ${insight.color}` }}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${insight.color}20` }}
                >
                  <insight.icon className="h-6 w-6" style={{ color: insight.color }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
