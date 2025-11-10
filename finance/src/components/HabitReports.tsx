import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Habit, HabitCompletion } from '@/types/routine';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HabitReportsProps {
  habits: Habit[];
  completions: HabitCompletion[];
  period: 'week' | 'month';
}

export const HabitReports = ({ habits, completions, period }: HabitReportsProps) => {
  const analytics = useMemo(() => {
    const today = new Date();
    const daysBack = period === 'week' ? 7 : 30;
    const startDate = subDays(today, daysBack);
    const dateRange = eachDayOfInterval({ start: startDate, end: today });

    const activeHabits = habits.filter((h) => h.isActive);

    if (activeHabits.length === 0) {
      return null;
    }

    // 1. Taxa média de cumprimento mensal
    let totalExpected = 0;
    let totalCompleted = 0;

    activeHabits.forEach((habit) => {
      dateRange.forEach((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const completion = completions.find(
          (c) => c.habitId === habit.id && c.completionDate === dateStr
        );
        totalExpected++;
        if (completion?.completed) {
          totalCompleted++;
        }
      });
    });

    const averageCompletion = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

    // 2. Streaks - dias consecutivos
    const calculateStreak = (habitId: string): number => {
      let streak = 0;
      let currentDate = new Date(today);

      while (true) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const completion = completions.find(
          (c) => c.habitId === habitId && c.completionDate === dateStr
        );

        if (completion?.completed) {
          streak++;
          currentDate = subDays(currentDate, 1);
        } else {
          break;
        }

        if (streak > 365) break; // Limite de segurança
      }

      return streak;
    };

    // 3. Top 3 hábitos mais consistentes
    const habitScores = activeHabits.map((habit) => {
      let completed = 0;
      let expected = 0;

      dateRange.forEach((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const completion = completions.find(
          (c) => c.habitId === habit.id && c.completionDate === dateStr
        );
        expected++;
        if (completion?.completed) {
          completed++;
        }
      });

      const percentage = expected > 0 ? (completed / expected) * 100 : 0;
      const streak = calculateStreak(habit.id);

      return {
        habit,
        percentage,
        streak,
        completed,
        expected,
      };
    });

    const topConsistent = [...habitScores]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    const topForgotten = [...habitScores]
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3);

    // 4. Dias com 100% dos hábitos concluídos
    let perfectDays = 0;
    dateRange.forEach((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const allCompleted = activeHabits.every((habit) => {
        const completion = completions.find(
          (c) => c.habitId === habit.id && c.completionDate === dateStr
        );
        return completion?.completed;
      });

      if (allCompleted && activeHabits.length > 0) {
        perfectDays++;
      }
    });

    // 5. Gráfico de evolução diária
    const dailyProgress = dateRange.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      let completed = 0;
      let expected = activeHabits.length;

      activeHabits.forEach((habit) => {
        const completion = completions.find(
          (c) => c.habitId === habit.id && c.completionDate === dateStr
        );
        if (completion?.completed) {
          completed++;
        }
      });

      const percentage = expected > 0 ? Math.round((completed / expected) * 100) : 0;

      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        percentage,
      };
    });

    // 6. Comparação entre hábitos (barras)
    const habitComparison = activeHabits.slice(0, 6).map((habit) => {
      let completed = 0;
      dateRange.forEach((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const completion = completions.find(
          (c) => c.habitId === habit.id && c.completionDate === dateStr
        );
        if (completion?.completed) {
          completed++;
        }
      });

      const percentage = Math.round((completed / dateRange.length) * 100);

      return {
        name: habit.name.length > 15 ? habit.name.substring(0, 15) + '...' : habit.name,
        percentage,
      };
    });

    // 7. Radar - equilíbrio (usando período como categorias)
    const periodComparison = [
      { period: 'Manhã', value: 0, count: 0 },
      { period: 'Tarde', value: 0, count: 0 },
      { period: 'Noite', value: 0, count: 0 },
    ];

    activeHabits.forEach((habit) => {
      let completed = 0;
      dateRange.forEach((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const completion = completions.find(
          (c) => c.habitId === habit.id && c.completionDate === dateStr
        );
        if (completion?.completed) {
          completed++;
        }
      });

      const percentage = (completed / dateRange.length) * 100;

      if (habit.period === 'morning') {
        periodComparison[0].value += percentage;
        periodComparison[0].count++;
      } else if (habit.period === 'afternoon') {
        periodComparison[1].value += percentage;
        periodComparison[1].count++;
      } else if (habit.period === 'night') {
        periodComparison[2].value += percentage;
        periodComparison[2].count++;
      }
    });

    const radarData = periodComparison.map((p) => ({
      period: p.period,
      value: p.count > 0 ? Math.round(p.value / p.count) : 0,
    }));

    return {
      averageCompletion,
      topConsistent,
      topForgotten,
      perfectDays,
      dailyProgress,
      habitComparison,
      radarData,
      totalDays: dateRange.length,
    };
  }, [habits, completions, period]);

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum hábito para gerar relatório
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Taxa Média de Cumprimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {analytics.averageCompletion}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Maior Streak Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              🔥 {Math.max(...analytics.topConsistent.map((h) => h.streak), 0)} dias
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Dias Perfeitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {analytics.perfectDays} / {analytics.totalDays}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Mais Consistentes */}
      <Card>
        <CardHeader>
          <CardTitle>Top 3 Hábitos Mais Consistentes 🏆</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topConsistent.map((item, index) => (
              <div key={item.habit.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? 'default' : 'secondary'}>
                    #{index + 1}
                  </Badge>
                  <span className="font-medium">{item.habit.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    🔥 {item.streak}d
                  </span>
                  <span className="font-bold text-green-600">
                    {Math.round(item.percentage)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Mais Esquecidos */}
      <Card>
        <CardHeader>
          <CardTitle>Top 3 Hábitos Mais Esquecidos 💭</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topForgotten.map((item, index) => (
              <div key={item.habit.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{item.habit.name}</span>
                </div>
                <span className="font-bold text-red-600">
                  {Math.round(item.percentage)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Evolução Diária */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Diária de Cumprimento 📈</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                name="% Cumprimento"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Comparação entre Hábitos */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação entre Hábitos 📊</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.habitComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="percentage" fill="#10b981" name="% Dias Cumpridos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar - Equilíbrio por Período */}
      <Card>
        <CardHeader>
          <CardTitle>Equilíbrio por Período do Dia 🎯</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={analytics.radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="period" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                name="% Cumprimento"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
