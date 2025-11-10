import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyMood, EMOTIONS, DAY_RATING_LABELS, Emotion } from '@/types/routine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface MoodStatsProps {
  moods: DailyMood[];
  period?: 'week' | 'month' | 'all';
}

export const MoodStats = ({ moods, period = 'month' }: MoodStatsProps) => {
  // Filtrar moods por período
  const filteredMoods = useMemo(() => {
    if (period === 'all') return moods;

    const now = new Date();
    const cutoffDate = new Date();

    if (period === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      cutoffDate.setDate(now.getDate() - 30);
    }

    return moods.filter((m) => new Date(m.moodDate) >= cutoffDate);
  }, [moods, period]);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalDays = filteredMoods.length;

    if (totalDays === 0) {
      return {
        totalDays: 0,
        avgRating: 0,
        mostCommonEmotion: null,
        ratingDistribution: [],
        emotionFrequency: [],
        ratingTrend: [],
      };
    }

    // Média de avaliação
    const ratingsSum = filteredMoods.reduce((sum, m) => sum + (m.dayRating ?? 0), 0);
    const avgRating = ratingsSum / totalDays;

    // Distribuição de avaliações
    const ratingCounts: Record<number, number> = {};
    filteredMoods.forEach((m) => {
      if (m.dayRating !== undefined) {
        ratingCounts[m.dayRating] = (ratingCounts[m.dayRating] || 0) + 1;
      }
    });

    const ratingDistribution = Object.entries(ratingCounts)
      .map(([rating, count]) => ({
        rating: DAY_RATING_LABELS[Number(rating) as keyof typeof DAY_RATING_LABELS],
        count,
        value: Number(rating),
      }))
      .sort((a, b) => a.value - b.value);

    // Frequência de emoções
    const emotionCounts: Record<string, number> = {};
    filteredMoods.forEach((m) => {
      m.emotionIds.forEach((emotionId) => {
        emotionCounts[emotionId] = (emotionCounts[emotionId] || 0) + 1;
      });
    });

    const emotionFrequency = Object.entries(emotionCounts)
      .map(([emotionId, count]) => {
        const emotion = EMOTIONS.find((e) => e.id === emotionId);
        return {
          emotion: emotion!,
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 emoções

    const mostCommonEmotion = emotionFrequency[0]?.emotion || null;

    // Tendência de avaliação ao longo do tempo (últimos 14 dias)
    const last14Days = [...filteredMoods]
      .sort((a, b) => new Date(a.moodDate).getTime() - new Date(b.moodDate).getTime())
      .slice(-14);

    const ratingTrend = last14Days.map((m) => ({
      date: new Date(m.moodDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      rating: m.dayRating ?? 0,
    }));

    return {
      totalDays,
      avgRating,
      mostCommonEmotion,
      ratingDistribution,
      emotionFrequency,
      ratingTrend,
    };
  }, [filteredMoods]);

  if (stats.totalDays === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum registro de humor encontrado para este período
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dias Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalDays}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avaliação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.avgRating.toFixed(1)}
              <span className="text-lg text-muted-foreground ml-2">/ 5</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {DAY_RATING_LABELS[Math.round(stats.avgRating) as keyof typeof DAY_RATING_LABELS]}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Emoção Mais Frequente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.mostCommonEmotion ? (
              <div>
                <div className="text-3xl font-bold flex items-center gap-2">
                  <span>{stats.mostCommonEmotion.emoji}</span>
                  <span className="text-2xl">{stats.mostCommonEmotion.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.emotionFrequency[0].count}x registrada
                </p>
              </div>
            ) : (
              <div className="text-muted-foreground">-</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de tendência de avaliação */}
      {stats.ratingTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.ratingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  name="Avaliação do Dia"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de avaliações */}
        {stats.ratingDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top emoções */}
        {stats.emotionFrequency.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Emoções Mais Frequentes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={stats.emotionFrequency}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="emotion.name"
                    width={100}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" name="Frequência" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lista de emoções com badges */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Emoções Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {stats.emotionFrequency.map(({ emotion, count }) => (
              <div
                key={emotion.id}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${emotion.color}20`,
                  color: emotion.color,
                }}
              >
                <span className="text-xl">{emotion.emoji}</span>
                <span>{emotion.name}</span>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-black/10 text-xs">
                  {count}x
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
