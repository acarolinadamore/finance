import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Routine, RoutineCompletion, PERIOD_LABELS } from '@/types/routine';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RoutineReportsProps {
  routines: Routine[];
  completions: RoutineCompletion[];
  period: 'week' | 'month';
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export const RoutineReports = ({ routines, completions, period }: RoutineReportsProps) => {
  const analytics = useMemo(() => {
    const today = new Date();
    const daysBack = period === 'week' ? 7 : 30;
    const startDate = subDays(today, daysBack);
    const dateRange = eachDayOfInterval({ start: startDate, end: today });

    const activeRoutines = routines.filter((r) => r.isActive);

    if (activeRoutines.length === 0) {
      return null;
    }

    // 1. % de rotinas concluídas por período
    const periodStats = {
      morning: { completed: 0, total: 0 },
      afternoon: { completed: 0, total: 0 },
      night: { completed: 0, total: 0 },
    };

    dateRange.forEach((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');

      activeRoutines.forEach((routine) => {
        const completion = completions.find(
          (c) => c.routineId === routine.id && c.completionDate === dateStr
        );

        periodStats[routine.period].total++;
        if (completion?.completed) {
          periodStats[routine.period].completed++;
        }
      });
    });

    const periodCompletion = Object.entries(periodStats).map(([period, data]) => ({
      period: PERIOD_LABELS[period as keyof typeof PERIOD_LABELS].label,
      emoji: PERIOD_LABELS[period as keyof typeof PERIOD_LABELS].emoji,
      percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      completed: data.completed,
      total: data.total,
    }));

    // 2. Horário com mais produtividade
    const mostProductivePeriod = periodCompletion.sort((a, b) => b.percentage - a.percentage)[0];

    // 3. Dias com todas as rotinas concluídas
    let perfectDays = 0;
    dateRange.forEach((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const allCompleted = activeRoutines.every((routine) => {
        const completion = completions.find(
          (c) => c.routineId === routine.id && c.completionDate === dateStr
        );
        return completion?.completed;
      });

      if (allCompleted && activeRoutines.length > 0) {
        perfectDays++;
      }
    });

    // 4. Progresso diário
    const dailyProgress = dateRange.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      let completed = 0;
      const total = activeRoutines.length;

      activeRoutines.forEach((routine) => {
        const completion = completions.find(
          (c) => c.routineId === routine.id && c.completionDate === dateStr
        );
        if (completion?.completed) {
          completed++;
        }
      });

      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        percentage,
        completed,
        total,
      };
    });

    // 5. Pizza - proporção concluídas vs pendentes
    let totalCompleted = 0;
    let totalPending = 0;

    dateRange.forEach((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');

      activeRoutines.forEach((routine) => {
        const completion = completions.find(
          (c) => c.routineId === routine.id && c.completionDate === dateStr
        );

        if (completion?.completed) {
          totalCompleted++;
        } else {
          totalPending++;
        }
      });
    });

    const pieData = [
      { name: 'Concluídas', value: totalCompleted },
      { name: 'Pendentes', value: totalPending },
    ];

    // 6. Padrão semanal
    const weekPattern = [
      { day: 'Dom', completed: 0, total: 0 },
      { day: 'Seg', completed: 0, total: 0 },
      { day: 'Ter', completed: 0, total: 0 },
      { day: 'Qua', completed: 0, total: 0 },
      { day: 'Qui', completed: 0, total: 0 },
      { day: 'Sex', completed: 0, total: 0 },
      { day: 'Sáb', completed: 0, total: 0 },
    ];

    dateRange.forEach((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay();

      activeRoutines.forEach((routine) => {
        const completion = completions.find(
          (c) => c.routineId === routine.id && c.completionDate === dateStr
        );

        weekPattern[dayOfWeek].total++;
        if (completion?.completed) {
          weekPattern[dayOfWeek].completed++;
        }
      });
    });

    const weeklyData = weekPattern.map((day) => ({
      ...day,
      percentage: day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0,
    }));

    // Taxa geral
    const totalExpected = activeRoutines.length * dateRange.length;
    const totalCompletedRate = totalExpected > 0
      ? Math.round((totalCompleted / totalExpected) * 100)
      : 0;

    return {
      periodCompletion,
      mostProductivePeriod,
      perfectDays,
      dailyProgress,
      pieData,
      weeklyData,
      totalDays: dateRange.length,
      totalCompleted,
      totalExpected,
      totalCompletedRate,
    };
  }, [routines, completions, period]);

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhuma rotina para gerar relatório
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
              Taxa de Conclusão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {analytics.totalCompletedRate}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {analytics.totalCompleted} / {analytics.totalExpected} rotinas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Período Mais Produtivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.mostProductivePeriod.emoji} {analytics.mostProductivePeriod.period}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {analytics.mostProductivePeriod.percentage}% de conclusão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Dias Completos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {analytics.perfectDays} / {analytics.totalDays}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Todas as rotinas concluídas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Produtividade por Período */}
      <Card>
        <CardHeader>
          <CardTitle>Produtividade por Período do Dia ☀️</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.periodCompletion} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="category" dataKey="period" />
              <YAxis type="number" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="percentage" fill="#8b5cf6" name="% Conclusão" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Progresso Diário */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso Diário 🕒</CardTitle>
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
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                name="% Conclusão"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pizza - Concluídas vs Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle>Proporção de Rotinas 🌗</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Padrão Semanal */}
      <Card>
        <CardHeader>
          <CardTitle>Padrão Semanal de Produtividade 📅</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="percentage" fill="#10b981" name="% Conclusão" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
