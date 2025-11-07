import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useFinanceStore, type CardSubcategoryExpense } from "@/store/useFinanceStore";
import { useCategories } from "@/hooks/useApiTransactions";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { CategorySelect } from "./CategorySelect";
import { CategoryManager } from "./CategoryManager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CARD_CATEGORY_COLOR = '#FF8C42'; // Laranja para "Não identificado"

interface IdentifiedExpense {
  cardId: string;
  cardName: string;
  category: string;
  amount: number;
}

export function CreditCardCategoryPieChart() {
  const { selectedMonth, cardSubcategoryExpenses, setCardSubcategoryExpenses, cardMonthlyExpenses, cards } = useFinanceStore();
  const { data: categories } = useCategories();

  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const [year, month] = selectedMonth.split('-').map(Number);
  const yearMonth = `${year}-${month - 1}`; // monthIndex 0-11

  // Usar chave especial "all" para gastos identificados
  const identifiedExpenses: IdentifiedExpense[] = cardSubcategoryExpenses['all']?.[yearMonth] || [];

  // Calcular total gasto em TODOS os cartões neste mês
  const totalCardExpenses = cards.reduce((sum, card) => {
    const key = `${year}-${month - 1}`;
    return sum + (cardMonthlyExpenses[card.id]?.[key] || 0);
  }, 0);

  // Agrupar por categoria (somar valores da mesma categoria)
  const categoryTotals = new Map<string, number>();
  identifiedExpenses.forEach(exp => {
    const current = categoryTotals.get(exp.category) || 0;
    categoryTotals.set(exp.category, current + exp.amount);
  });

  const totalIdentified = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0);
  const remaining = totalCardExpenses - totalIdentified;

  // Preparar dados para o gráfico
  const chartData = [];

  // Adicionar categorias identificadas
  Array.from(categoryTotals.entries()).forEach(([categoryName, amount]) => {
    const category = categories?.find(c => c.name === categoryName);
    chartData.push({
      name: categoryName,
      value: amount,
      color: category?.color || '#6B7280',
    });
  });

  // Adicionar "Não identificado" se houver
  if (remaining > 0) {
    chartData.push({
      name: 'Não identificado',
      value: remaining,
      color: CARD_CATEGORY_COLOR,
    });
  }

  // Ordenar por valor (maior para menor)
  chartData.sort((a, b) => b.value - a.value);

  const handleAdd = () => {
    if (!selectedCardId || !newCategory || !newAmount) return;

    const selectedCard = cards.find(c => c.id === selectedCardId);
    if (!selectedCard) return;

    const newExpense: IdentifiedExpense = {
      cardId: selectedCardId,
      cardName: selectedCard.nickname,
      category: newCategory,
      amount: parseFloat(newAmount),
    };

    const updatedExpenses = [...identifiedExpenses, newExpense];
    setCardSubcategoryExpenses('all', yearMonth, updatedExpenses as any);

    setSelectedCardId('');
    setNewCategory('');
    setNewAmount('');
  };

  const handleDelete = (index: number) => {
    const updatedExpenses = identifiedExpenses.filter((_, i) => i !== index);
    setCardSubcategoryExpenses('all', yearMonth, updatedExpenses as any);
  };

  const handleUpdateAmount = (index: number, newValue: string) => {
    const updatedExpenses = [...identifiedExpenses];
    updatedExpenses[index].amount = parseFloat(newValue) || 0;
    setCardSubcategoryExpenses('all', yearMonth, updatedExpenses as any);
  };

  if (cards.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Gastos de Cartão de Crédito por Categoria</h3>
        <div className="text-center text-muted-foreground">
          Nenhum cartão cadastrado. Use o botão "Gerenciar Cartões" para adicionar.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Gastos de Cartão de Crédito por Categoria</h3>
        <p className="text-sm text-muted-foreground">
          Total em cartões: R$ {totalCardExpenses.toFixed(2)} • Categorizado: R$ {totalIdentified.toFixed(2)} •
          <span className={remaining < 0 ? 'text-red-500 font-semibold' : 'text-muted-foreground'}>
            {' '}Restante: R$ {remaining.toFixed(2)}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico */}
        <div className="flex items-center justify-center">
          {totalCardExpenses > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value, name }) => {
                    const percentage = totalCardExpenses > 0 ? (value / totalCardExpenses) * 100 : 0;
                    return `${percentage.toFixed(1)}%`;
                  }}
                  outerRadius={100}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum gasto em cartões neste mês
            </div>
          )}
        </div>

        {/* Lista e cadastro */}
        <div className="space-y-4">
          {/* Formulário de adição */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="text-sm font-semibold mb-3">Identificar Gasto</h4>
            <div className="space-y-2">
              <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cartão" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${card.color}20`,
                          color: card.color,
                        }}
                      >
                        {card.nickname}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <CategorySelect
                  value={newCategory}
                  onChange={setNewCategory}
                />
                <CategoryManager compact />
              </div>

              <Input
                type="number"
                step="0.01"
                placeholder="Valor (R$)"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
              />

              <Button onClick={handleAdd} className="w-full" size="sm">
                Identificar
              </Button>
            </div>
          </div>

          {/* Lista de gastos identificados */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {identifiedExpenses.map((item, index) => {
              const category = categories?.find(c => c.name === item.category);
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category?.color || '#6B7280' }}
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: category ? `${category.color}20` : '#6B728020',
                          color: category?.color || '#6B7280',
                        }}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.cardName}
                      </span>
                    </div>
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => handleUpdateAmount(index, e.target.value)}
                    className="w-28 h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
