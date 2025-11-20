import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCycleRecords, useCycleStats } from '@/hooks/useCycle';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FLOW_LABELS, type FlowLevel } from '@/types/cycle';

const FLOW_COLORS: Record<FlowLevel, string> = {
  none: '#e5e7eb',
  light: '#fde047',
  moderate: '#fb923c',
  heavy: '#dc2626',
};

const EMOTION_CATEGORIES = [
  { name: 'Ansiedade', symptoms: ['ansiedade', 'irritabilidade', 'nervosismo'] },
  { name: 'Tristeza', symptoms: ['tristeza', 'melancolia'] },
  { name: 'Energia', symptoms: ['energia alta', 'energia baixa', 'cansaço extremo'] },
  { name: 'Dor', symptoms: ['cólica', 'dor de cabeça', 'enxaqueca', 'dor lombar'] },
  { name: 'Sono', symptoms: ['insônia', 'sonolência'] },
  { name: 'Apetite', symptoms: ['desejo por doce', 'desejo por salgado'] },
];

export function CycleReports() {
  const { data: records = [] } = useCycleRecords();
  const { data: stats } = useCycleStats();

  const last90Days = useMemo(() => {
    const today = new Date();
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
    return records.filter(r => new Date(r.record_date) >= ninetyDaysAgo);
  }, [records]);

  const flowData = useMemo(() => {
    const flowMap: Record<FlowLevel, number> = {
      none: 0,
      light: 1,
      moderate: 2,
      heavy: 3,
    };

    return last90Days
      .map(r => ({
        date: new Date(r.record_date).getDate(),
        intensidade: flowMap[r.flow_level],
        nivel: FLOW_LABELS[r.flow_level],
      }))
      .reverse();
  }, [last90Days]);

  const symptomFrequency = useMemo(() => {
    const counts: Record<string, number> = {};

    last90Days.forEach(r => {
      r.symptoms.forEach(symptom => {
        counts[symptom] = (counts[symptom] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [last90Days]);

  const flowDistribution = useMemo(() => {
    const counts: Record<FlowLevel, number> = {
      none: 0,
      light: 0,
      moderate: 0,
      heavy: 0,
    };

    last90Days.forEach(r => {
      counts[r.flow_level]++;
    });

    return (Object.keys(counts) as FlowLevel[]).map(level => ({
      name: FLOW_LABELS[level],
      value: counts[level],
      color: FLOW_COLORS[level],
    }));
  }, [last90Days]);

  const emotionalProfile = useMemo(() => {
    const profile = EMOTION_CATEGORIES.map(category => {
      const count = last90Days.reduce((sum, record) => {
        const matchingSymptoms = record.symptoms.filter(s =>
          category.symptoms.some(cs => s.toLowerCase().includes(cs.toLowerCase()))
        );
        return sum + matchingSymptoms.length;
      }, 0);

      return {
        category: category.name,
        frequency: count,
      };
    });

    return profile;
  }, [last90Days]);

  const insights = useMemo(() => {
    const insights: string[] = [];

    if (stats) {
      const avgFlowDays = last90Days.filter(r => r.flow_level !== 'none').length / 3;
      insights.push(`💧 Seus fluxos duraram em média ${avgFlowDays.toFixed(1)} dias nos últimos 3 meses.`);

      if (stats.isRegular) {
        insights.push(`🌙 Ciclos regulares nos últimos meses.`);
      } else {
        insights.push(`⚠️ Ciclo apresenta irregularidade. Considere consultar um médico.`);
      }

      if (stats.topSymptoms.length > 0) {
        insights.push(`⚡ Sintoma mais recorrente: ${stats.topSymptoms[0]}.`);
      }
    }

    return insights;
  }, [last90Days, stats]);

  if (last90Days.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Registre dados para visualizar relatórios
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Intensidade do Fluxo</CardTitle>
            <CardDescription>Últimos 90 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={flowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} />
                <Tooltip />
                <Area type="monotone" dataKey="intensidade" stroke="#dc2626" fill="#fecaca" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequência de Sintomas</CardTitle>
            <CardDescription>Top 10 mais comuns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={symptomFrequency} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Fluxo</CardTitle>
            <CardDescription>Proporção dos níveis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={flowDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {flowDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil Emocional</CardTitle>
          <CardDescription>Prevalência de sentimentos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={emotionalProfile}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis />
              <Radar name="Frequência" dataKey="frequency" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <CardTitle>💡 Insights Automáticos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <p key={index} className="text-sm bg-white dark:bg-slate-900 p-3 rounded-lg">
                {insight}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
