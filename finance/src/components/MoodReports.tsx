import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DailyMood, EMOTIONS, DAY_RATING_LABELS } from '@/types/routine';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, eachDayOfInterval, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MoodReportsProps {
  moods: DailyMood[];
  period: 'week' | 'month';
}

const WEEK_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const MoodReports = ({ moods, period }: MoodReportsProps) => {
  const analytics = useMemo(() => {
    const today = new Date();
    const daysBack = period === 'week' ? 7 : 30;
    const startDate = subDays(today, daysBack);
    const dateRange = eachDayOfInterval({ start: startDate, end: today });

    const periodMoods = moods.filter((m) => {
      const moodDate = new Date(m.moodDate);
      return moodDate >= startDate && moodDate <= today;
    });

    if (periodMoods.length === 0) {
      return null;
    }

    // 1. Média de humor
    const ratingsSum = periodMoods.reduce((sum, m) => sum + (m.dayRating ?? 0), 0);
    const averageRating = periodMoods.length > 0 ? ratingsSum / periodMoods.length : 0;

    // 2. Humor mais frequente
    const emotionCounts: Record<string, number> = {};
    periodMoods.forEach((m) => {
      m.emotionIds.forEach((emotionId) => {
        emotionCounts[emotionId] = (emotionCounts[emotionId] || 0) + 1;
      });
    });

    const emotionFrequency = Object.entries(emotionCounts)
      .map(([emotionId, count]) => {
        const emotion = EMOTIONS.find((e) => e.id === emotionId);
        return { emotion: emotion!, count };
      })
      .sort((a, b) => b.count - a.count);

    const mostFrequentEmotion = emotionFrequency[0] || null;
    const emotionPercentage = mostFrequentEmotion
      ? Math.round((mostFrequentEmotion.count / periodMoods.length) * 100)
      : 0;

    // 3. Melhor dia da semana
    const dayRatings: Record<number, { sum: number; count: number }> = {};
    periodMoods.forEach((m) => {
      const dayOfWeek = getDay(new Date(m.moodDate));
      if (!dayRatings[dayOfWeek]) {
        dayRatings[dayOfWeek] = { sum: 0, count: 0 };
      }
      dayRatings[dayOfWeek].sum += m.dayRating ?? 0;
      dayRatings[dayOfWeek].count++;
    });

    const dayAverages = Object.entries(dayRatings).map(([day, data]) => ({
      day: parseInt(day),
      dayName: WEEK_DAYS[parseInt(day)],
      average: data.count > 0 ? data.sum / data.count : 0,
      count: data.count,
    }));

    const bestDayOfWeek = dayAverages.sort((a, b) => b.average - a.average)[0];

    // 4. Gráfico de variação ao longo dos dias
    const dailyMoodTrend = dateRange.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const mood = periodMoods.find((m) => m.moodDate === dateStr);

      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        rating: mood?.dayRating ?? null,
      };
    });

    // 5. Distribuição de categorias de emoções
    const categoryCount = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    periodMoods.forEach((m) => {
      m.emotionIds.forEach((emotionId) => {
        const emotion = EMOTIONS.find((e) => e.id === emotionId);
        if (emotion) {
          categoryCount[emotion.category]++;
        }
      });
    });

    const totalEmotions =
      categoryCount.positive + categoryCount.neutral + categoryCount.negative;

    const emotionDistribution = [
      {
        category: 'Positivas',
        count: categoryCount.positive,
        percentage:
          totalEmotions > 0
            ? Math.round((categoryCount.positive / totalEmotions) * 100)
            : 0,
      },
      {
        category: 'Neutras',
        count: categoryCount.neutral,
        percentage:
          totalEmotions > 0
            ? Math.round((categoryCount.neutral / totalEmotions) * 100)
            : 0,
      },
      {
        category: 'Negativas',
        count: categoryCount.negative,
        percentage:
          totalEmotions > 0
            ? Math.round((categoryCount.negative / totalEmotions) * 100)
            : 0,
      },
    ];

    // 6. Dias com emoções positivas
    const daysWithPositiveEmotions = periodMoods.filter((m) => {
      return m.emotionIds.some((emotionId) => {
        const emotion = EMOTIONS.find((e) => e.id === emotionId);
        return emotion?.category === 'positive';
      });
    }).length;

    // 7. Top 5 emoções
    const topEmotions = emotionFrequency.slice(0, 5);

    return {
      averageRating,
      mostFrequentEmotion,
      emotionPercentage,
      bestDayOfWeek,
      dailyMoodTrend,
      emotionDistribution,
      daysWithPositiveEmotions,
      totalDays: dateRange.length,
      registeredDays: periodMoods.length,
      topEmotions,
      dayAverages: dayAverages.sort((a, b) => a.day - b.day),
    };
  }, [moods, period]);

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum registro de humor para gerar relatório
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
              Humor Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {analytics.averageRating.toFixed(1)} / 5
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {DAY_RATING_LABELS[Math.round(analytics.averageRating) as keyof typeof DAY_RATING_LABELS]}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Emoção Mais Frequente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.mostFrequentEmotion ? (
              <>
                <div className="text-3xl font-bold flex items-center gap-2">
                  <span>{analytics.mostFrequentEmotion.emotion.emoji}</span>
                  <span className="text-2xl">{analytics.mostFrequentEmotion.emotion.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {analytics.emotionPercentage}% dos registros
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">-</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Melhor Dia da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.bestDayOfWeek ? (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {analytics.bestDayOfWeek.dayName}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Média: {analytics.bestDayOfWeek.average.toFixed(1)} / 5
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">-</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dias com emoções positivas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">
            Dias com Emoções Positivas 🌟
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {analytics.daysWithPositiveEmotions} / {analytics.registeredDays}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {Math.round((analytics.daysWithPositiveEmotions / analytics.registeredDays) * 100)}% dos dias registrados
          </p>
        </CardContent>
      </Card>

      {/* Gráfico de Variação de Humor */}
      <Card>
        <CardHeader>
          <CardTitle>Variação do Humor ao Longo dos Dias 📆</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.dailyMoodTrend}>
              <defs>
                <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="rating"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#colorRating)"
                name="Avaliação do Dia"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição de Emoções por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Emoções 🧭</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.emotionDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="percentage" fill="#8b5cf6" name="% de Emoções" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Média por Dia da Semana */}
      <Card>
        <CardHeader>
          <CardTitle>Humor por Dia da Semana 📅</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.dayAverages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dayName" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#10b981" name="Humor Médio" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 5 Emoções */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Emoções Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topEmotions.map((item, index) => (
              <div key={item.emotion.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? 'default' : 'secondary'}>
                    #{index + 1}
                  </Badge>
                  <span className="text-2xl">{item.emotion.emoji}</span>
                  <span className="font-medium">{item.emotion.name}</span>
                </div>
                <span className="font-bold" style={{ color: item.emotion.color }}>
                  {item.count}x
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
