import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface HabitMetricsProps {
  monthlyAverage: number;
  bestDays: number;
  totalDaysInMonth: number;
}

export const HabitMetrics = ({
  monthlyAverage,
  bestDays,
  totalDaysInMonth,
}: HabitMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Progresso Geral do Mês */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Progresso Geral do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-primary">
                {monthlyAverage}%
              </span>
              <span className="text-sm text-muted-foreground">
                Média de cumprimento
              </span>
            </div>
            <Progress value={monthlyAverage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Melhores Dias */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Melhores Dias ⭐
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-green-600">
              {bestDays}
            </span>
            <span className="text-sm text-muted-foreground">
              / {totalDaysInMonth} dias
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Dias em que você concluiu a maioria dos hábitos (mais da metade)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
