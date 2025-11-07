import { Card } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";

interface CreditCardSummary {
  id: string;
  name: string;
  color: string;
  total: number;
}

export function CreditCardSummaryCards() {
  const { cards, cardMonthlyExpenses, selectedMonth, selectedYear } = useFinanceStore();

  // Extrair mês atual do selectedMonth (formato: YYYY-MM)
  const currentMonth = selectedMonth ? parseInt(selectedMonth.split('-')[1]) - 1 : new Date().getMonth();

  // Agrupar gastos mensais por cartão
  const cardSummaries: CreditCardSummary[] = (cards || [])
    .map((card) => {
      // Somar gastos do mês atual
      const key = `${selectedYear}-${currentMonth}`;
      const total = cardMonthlyExpenses[card.id]?.[key] || 0;

      return {
        id: card.id,
        name: card.nickname,
        color: card.color || '#8B5CF6',
        total,
      };
    })
    .filter((card) => card.total > 0); // Mostrar apenas cartões com gastos

  const totalAllCards = cardSummaries.reduce((sum, card) => sum + card.total, 0);

  // Se não houver cartões ou transações, mostrar mensagem
  if (cards.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Nenhum cartão cadastrado. Use o botão "Gerenciar Cartões" para adicionar.
        </p>
      </Card>
    );
  }

  if (cardSummaries.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Nenhuma transação de cartão de crédito registrada ainda.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Card Total Geral */}
      <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Gasto Total</p>
            <p className="text-xs text-muted-foreground">Cartões de Crédito</p>
            <h3 className="text-3xl font-bold text-red-600 mt-2">
              R$ {totalAllCards.toFixed(2)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {cardSummaries.length} cartão{cardSummaries.length !== 1 ? 'es' : ''}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-red-200 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </Card>

      {/* Cards Individuais */}
      {cardSummaries.map((card) => (
        <Card
          key={card.id}
          className="p-6 border-2 hover:shadow-md transition-shadow"
          style={{ borderColor: `${card.color}40` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-3 py-1 rounded text-sm font-semibold"
                  style={{
                    backgroundColor: `${card.color}20`,
                    color: card.color,
                  }}
                >
                  {card.name}
                </span>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: card.color }}>
                R$ {card.total.toFixed(2)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {((card.total / totalAllCards) * 100).toFixed(1)}% do total
              </p>
            </div>
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${card.color}20` }}
            >
              <CreditCard className="h-6 w-6" style={{ color: card.color }} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
