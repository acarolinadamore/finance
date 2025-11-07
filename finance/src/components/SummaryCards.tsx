import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Calculator } from "lucide-react";
import { useTransactions } from "@/hooks/useApiTransactions";
import { useFinanceStore } from "@/store/useFinanceStore";

export const SummaryCards = () => {
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { selectedMonth } = useFinanceStore();

  const isLoading = transactionsLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  // Filtrar transações do mês selecionado
  const [year, month] = selectedMonth.split('-').map(Number);
  const monthTransactions = transactions?.filter(t => {
    if (!t.due_date) return false;
    const date = new Date(t.due_date);
    const transMonth = date.getMonth() + 1;
    const transYear = date.getFullYear();
    return transMonth === month && transYear === year;
  }) || [];

  // Calcular valores reais (baseado nas transações do mês)
  const income = monthTransactions
    .filter(t => t.type === 'income' && t.amount)
    .reduce((sum, t) => sum + parseFloat(t.amount as any || '0'), 0);

  const expenses = monthTransactions
    .filter(t => t.type === 'expense' && t.amount)
    .reduce((sum, t) => sum + parseFloat(t.amount as any || '0'), 0);

  const balance = income - expenses;

  // Calcular valores estimados (do mês selecionado)
  const estimatedIncome = monthTransactions
    .filter(t => t.type === 'income' && t.estimated_amount)
    .reduce((sum, t) => sum + parseFloat(t.estimated_amount as any || '0'), 0);

  const estimatedExpenses = monthTransactions
    .filter(t => t.type === 'expense' && t.estimated_amount)
    .reduce((sum, t) => sum + parseFloat(t.estimated_amount as any || '0'), 0);

  const estimatedBalance = estimatedIncome - estimatedExpenses;

  return (
    <div className="space-y-6">
      {/* Valores Reais */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Valores Reais</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6 border-2 hover:shadow-md transition-shadow border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Entrada</p>
                <h3 className="text-2xl font-bold text-green-600">
                  R$ {income.toFixed(2)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 hover:shadow-md transition-shadow border-red-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Saída</p>
                <h3 className="text-2xl font-bold text-red-500">
                  R$ {expenses.toFixed(2)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 hover:shadow-md transition-shadow border-blue-400">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Sobra</p>
                <h3 className="text-2xl font-bold text-blue-600">
                  R$ {balance.toFixed(2)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Valores Estimados */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Valores Estimados</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6 border-2 border-dashed hover:shadow-md transition-shadow border-green-400">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Entrada Estimada</p>
                <h3 className="text-2xl font-bold text-green-600">
                  R$ {estimatedIncome.toFixed(2)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-dashed hover:shadow-md transition-shadow border-red-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Saída Estimada</p>
                <h3 className="text-2xl font-bold text-red-500">
                  R$ {estimatedExpenses.toFixed(2)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-dashed hover:shadow-md transition-shadow border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Sobra Estimada</p>
                <h3 className="text-2xl font-bold text-blue-600">
                  R$ {estimatedBalance.toFixed(2)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
