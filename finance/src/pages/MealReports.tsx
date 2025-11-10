import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Download } from 'lucide-react';
import { useMeals } from '@/hooks/useMeals';
import {
  MEAL_TYPE_LABELS,
  HUNGER_LEVEL_LABELS,
  SATISFACTION_LEVEL_LABELS,
  MealType,
  HungerLevel,
  SatisfactionLevel,
} from '@/types/meals';
import {
  BarChart,
  Bar,
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
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const MealReports = () => {
  const { meals, getMealsByDateRange, getMealsByType } = useMeals();
  const [period, setPeriod] = useState<'7days' | '30days' | 'all'>('7days');
  const [filterMealType, setFilterMealType] = useState<string>('all');

  // Calcular período
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();

    if (period === '7days') {
      start.setDate(start.getDate() - 7);
    } else if (period === '30days') {
      start.setDate(start.getDate() - 30);
    } else {
      // Para 'all', retornar data muito antiga
      start.setFullYear(2000);
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const dateRange = getDateRange();
  const filteredMeals = useMemo(() => {
    let result = getMealsByDateRange(dateRange.start, dateRange.end);
    if (filterMealType !== 'all') {
      result = result.filter((m) => m.mealType === filterMealType);
    }
    return result;
  }, [meals, period, filterMealType, dateRange]);

  // Estatísticas
  const stats = useMemo(() => {
    const mealsByType: Record<string, number> = {};
    const hungerPatterns: Record<string, number> = {};
    const satisfactionPatterns: Record<string, number> = {};

    filteredMeals.forEach((meal) => {
      mealsByType[meal.mealType] = (mealsByType[meal.mealType] || 0) + 1;
      hungerPatterns[meal.hungerLevel] =
        (hungerPatterns[meal.hungerLevel] || 0) + 1;
      satisfactionPatterns[meal.satisfactionLevel] =
        (satisfactionPatterns[meal.satisfactionLevel] || 0) + 1;
    });

    return {
      totalMeals: filteredMeals.length,
      mealsByType,
      hungerPatterns,
      satisfactionPatterns,
    };
  }, [filteredMeals]);

  // Dados para gráficos
  const mealTypeData = Object.entries(stats.mealsByType).map(([type, count]) => ({
    name: MEAL_TYPE_LABELS[type as MealType],
    value: count,
  }));

  const hungerData = Object.entries(stats.hungerPatterns).map(([level, count]) => ({
    name: HUNGER_LEVEL_LABELS[level as HungerLevel].label,
    value: count,
  }));

  const satisfactionData = Object.entries(stats.satisfactionPatterns).map(
    ([level, count]) => ({
      name: SATISFACTION_LEVEL_LABELS[level as SatisfactionLevel].label,
      value: count,
    })
  );

  // Cores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Gerar PDF
  const generatePDF = async () => {
    try {
      toast.loading('Gerando PDF...');

      const reportElement = document.getElementById('meal-report');
      if (!reportElement) return;

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      const periodLabel =
        period === '7days' ? '7_dias' : period === '30days' ? '30_dias' : 'completo';
      pdf.save(`relatorio_refeicoes_${periodLabel}_${new Date().toISOString().split('T')[0]}.pdf`);

      toast.dismiss();
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      toast.dismiss();
      toast.error('Erro ao gerar PDF');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/meals">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Relatórios de Refeições</h1>
              <p className="text-muted-foreground text-sm">
                Análise dos seus padrões alimentares
              </p>
            </div>
          </div>
          <Button onClick={generatePDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMealType} onValueChange={setFilterMealType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tipo de refeição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as refeições</SelectItem>
                {Object.entries(MEAL_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conteúdo do Relatório */}
        <div id="meal-report" className="space-y-6 bg-background p-6">
          {/* Estatísticas gerais */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Total de Refeições</p>
                  <p className="text-4xl font-bold">{stats.totalMeals}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Tipos Diferentes</p>
                  <p className="text-4xl font-bold">
                    {Object.keys(stats.mealsByType).length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Média Diária</p>
                  <p className="text-4xl font-bold">
                    {period === '7days'
                      ? (stats.totalMeals / 7).toFixed(1)
                      : period === '30days'
                      ? (stats.totalMeals / 30).toFixed(1)
                      : (stats.totalMeals / Math.max(1, filteredMeals.length)).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Refeições por Tipo */}
          {mealTypeData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Refeições por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mealTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mealTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mealTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis allowDecimals={false} domain={[0, 'dataMax + 2']} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Quantidade" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gráfico de Fome x Satisfação */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hungerData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Padrão de Fome</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hungerData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} domain={[0, 'dataMax + 2']} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Frequência" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {satisfactionData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Padrão de Satisfação</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={satisfactionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} domain={[0, 'dataMax + 2']} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Frequência" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Insights e Padrões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.totalMeals === 0 ? (
                <p className="text-muted-foreground">
                  Registre suas refeições para ver insights personalizados.
                </p>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="font-medium">Frequência de Refeições</p>
                      <p className="text-sm text-muted-foreground">
                        Você registrou {stats.totalMeals} refeições no período
                        selecionado.
                      </p>
                    </div>
                  </div>

                  {Object.entries(stats.hungerPatterns).length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <span className="text-2xl">🍽️</span>
                      <div>
                        <p className="font-medium">Padrão de Fome</p>
                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            const maxHunger = Object.entries(
                              stats.hungerPatterns
                            ).reduce((a, b) => (b[1] > a[1] ? b : a));
                            return `Na maioria das vezes, você come quando está com ${
                              HUNGER_LEVEL_LABELS[maxHunger[0] as HungerLevel].label.toLowerCase()
                            }.`;
                          })()}
                        </p>
                      </div>
                    </div>
                  )}

                  {Object.entries(stats.satisfactionPatterns).length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <span className="text-2xl">😌</span>
                      <div>
                        <p className="font-medium">Padrão de Satisfação</p>
                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            const maxSatisfaction = Object.entries(
                              stats.satisfactionPatterns
                            ).reduce((a, b) => (b[1] > a[1] ? b : a));
                            return `Geralmente você se sente ${
                              SATISFACTION_LEVEL_LABELS[
                                maxSatisfaction[0] as SatisfactionLevel
                              ].label.toLowerCase()
                            } após as refeições.`;
                          })()}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MealReports;
