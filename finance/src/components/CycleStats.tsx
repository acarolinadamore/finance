import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCycleStats } from '@/hooks/useCycle';
import { Calendar, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CycleStats() {
  const { data: stats, isLoading, error } = useCycleStats();

  if (isLoading) {
    return <div className="text-center py-8">Carregando estatísticas...</div>;
  }

  if (error || !stats) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Configure suas informações primeiro</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular data estimada da próxima menstruação
  const nextPeriodDate = addDays(new Date(), stats.daysUntilNextPeriod);
  const formattedNextPeriodDate = format(nextPeriodDate, "d 'de' MMMM", { locale: ptBR });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dia do Ciclo</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.currentCycleDay}</div>
          <p className="text-xs text-muted-foreground">
            de {stats.averageCycleLength} dias
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próxima Menstruação</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formattedNextPeriodDate}
          </div>
          <p className="text-sm font-medium mt-1">
            Faltam {stats.daysUntilNextPeriod} {stats.daysUntilNextPeriod === 1 ? 'dia' : 'dias'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Duração média: {stats.averagePeriodLength} dias
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Regularidade</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <Badge variant={stats.isRegular ? 'default' : 'secondary'}>
              {stats.isRegular ? 'Estável' : 'Irregular'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Variação: {stats.variance} dias
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sintomas Comuns</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {stats.topSymptoms.length > 0 ? (
              stats.topSymptoms.map((symptom, index) => (
                <p key={index} className="text-sm">
                  • {symptom}
                </p>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum registrado</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
