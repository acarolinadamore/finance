import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useFinanceStore } from "@/store/useFinanceStore";

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function CreditCardChart() {
  const { cards, cardMonthlyExpenses, selectedMonth, selectedYear } = useFinanceStore();

  // Extrair mês atual do selectedMonth (formato: YYYY-MM)
  const currentMonth = selectedMonth ? parseInt(selectedMonth.split('-')[1]) - 1 : new Date().getMonth();

  // Gerar array de 12 meses a partir do mês atual
  const generateMonths = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const yearOffset = Math.floor((currentMonth + i) / 12);
      const year = selectedYear + yearOffset;
      months.push({
        name: MONTH_NAMES[monthIndex],
        monthIndex: monthIndex,
        year: year,
      });
    }
    return months;
  };

  const months = generateMonths();

  // Mapear dados mensais reais de cada cartão
  const data = months.map((month) => {
    const monthData: any = { name: month.name };
    const key = `${month.year}-${month.monthIndex}`;
    cards.forEach((card) => {
      monthData[card.nickname] = cardMonthlyExpenses[card.id]?.[key] || 0;
    });
    return monthData;
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Evolução Mensal dos Gastos</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {cards.map((card) => (
            <Line
              key={card.id}
              type="monotone"
              dataKey={card.nickname}
              stroke={card.color || '#8B5CF6'}
              strokeWidth={2}
              dot={{ fill: card.color || '#8B5CF6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
