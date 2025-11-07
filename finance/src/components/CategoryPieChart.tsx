import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useTransactions, useCategories } from "@/hooks/useApiTransactions";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";

const COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#EAB308', // yellow
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
];

export function CategoryPieChart() {
  const { selectedMonth, selectedYear } = useFinanceStore();
  const { data: transactions } = useTransactions();
  const { data: categories } = useCategories();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  // Calcular gastos por categoria para o mês selecionado
  const categoryData = useMemo(() => {
    if (!transactions || !categories) return [];

    // Filtrar transações do mês selecionado e apenas despesas
    const monthTransactions = transactions.filter(t => {
      if (t.type !== 'expense') return false;
      if (!t.due_date) return false;

      const date = new Date(t.due_date);
      const transMonth = date.getMonth();
      const transYear = date.getFullYear();
      const [selectedYearNum, selectedMonthNum] = selectedMonth.split('-').map(Number);

      return transMonth === selectedMonthNum - 1 && transYear === selectedYearNum;
    });

    // Agrupar por categoria
    const categoryTotals = new Map<string, number>();
    monthTransactions.forEach(t => {
      const current = categoryTotals.get(t.category) || 0;
      const amount = parseFloat(t.amount as any) || 0;
      categoryTotals.set(t.category, current + amount);
    });

    // Converter para array e ordenar por valor
    return Array.from(categoryTotals.entries())
      .map(([name, value]) => {
        const category = categories.find(c => c.name === name);
        return {
          name,
          value,
          color: category?.color || '#6B7280',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories, selectedMonth]);

  // Filtrar dados baseado nas categorias selecionadas
  const filteredData = useMemo(() => {
    if (selectedCategories.size === 0) return categoryData;
    return categoryData.filter(item => selectedCategories.has(item.name));
  }, [categoryData, selectedCategories]);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedCategories(new Set(categoryData.map(d => d.name)));
  };

  const clearAll = () => {
    setSelectedCategories(new Set());
  };

  const total = filteredData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {/* Gráfico */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Nenhum gasto registrado neste mês
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Filtros e Lista */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filtrar Categorias</h3>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-primary hover:underline"
              >
                Todas
              </button>
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:underline"
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {categoryData.map((item) => {
              const isSelected = selectedCategories.size === 0 || selectedCategories.has(item.name);
              const percentage = total > 0 ? (item.value / total) * 100 : 0;

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Checkbox
                        id={`cat-${item.name}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleCategory(item.name)}
                      />
                      <Label
                        htmlFor={`cat-${item.name}`}
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </Label>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        R$ {item.value.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="ml-6">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold text-primary">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
