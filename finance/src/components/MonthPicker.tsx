import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import { useFinanceStore } from "@/store/useFinanceStore";
import { useTransactions, useCreateTransaction } from "@/hooks/useApiTransactions";

dayjs.locale('pt-br');

export const MonthPicker = () => {
  const { selectedMonth, setSelectedMonth, setSelectedYear } = useFinanceStore();
  const { data: transactions } = useTransactions();
  const createMutation = useCreateTransaction();

  const handlePrevMonth = () => {
    const prev = dayjs(selectedMonth).subtract(1, 'month').format('YYYY-MM');
    setSelectedMonth(prev);

    // Atualizar o ano se mudou
    const newYear = dayjs(prev).year();
    setSelectedYear(newYear);
  };

  const duplicateTransactions = async (fromMonth: string, toMonth: string) => {
    if (!transactions) return;

    const [fromYear, fromMonthNum] = fromMonth.split('-').map(Number);
    const [toYear, toMonthNum] = toMonth.split('-').map(Number);

    // Filtrar transações do mês anterior
    const previousMonthTransactions = transactions.filter(t => {
      if (!t.due_date) return false;
      const date = new Date(t.due_date);
      const transMonth = date.getMonth() + 1;
      const transYear = date.getFullYear();
      return transMonth === fromMonthNum && transYear === fromYear;
    });

    if (previousMonthTransactions.length === 0) {
      return;
    }

    // Duplicar cada transação com a nova data
    for (const transaction of previousMonthTransactions) {
      const oldDate = new Date(transaction.due_date!);
      const newDate = new Date(toYear, toMonthNum - 1, oldDate.getDate());

      // Ajustar para o último dia do mês se o dia não existir no novo mês
      if (newDate.getMonth() !== toMonthNum - 1) {
        newDate.setDate(0); // Vai para o último dia do mês anterior
      }

      const newTransaction = {
        ...transaction,
        id: undefined, // Remover ID para criar nova
        due_date: newDate.toISOString().split('T')[0],
        closing_date: transaction.closing_date ?
          dayjs(transaction.closing_date).month(toMonthNum - 1).year(toYear).format('YYYY-MM-DD') :
          undefined,
      };

      try {
        await createMutation.mutateAsync(newTransaction);
      } catch (error) {
        console.error('Erro ao duplicar transação:', error);
      }
    }
  };

  const handleNextMonth = async () => {
    const next = dayjs(selectedMonth).add(1, 'month').format('YYYY-MM');
    const [nextYear, nextMonth] = next.split('-').map(Number);

    // Verificar se o próximo mês já tem transações
    const hasTransactions = transactions?.some(t => {
      if (!t.due_date) return false;
      const date = new Date(t.due_date);
      const transMonth = date.getMonth() + 1;
      const transYear = date.getFullYear();
      return transMonth === nextMonth && transYear === nextYear;
    });

    setSelectedMonth(next);

    // Atualizar o ano se mudou
    const newYear = dayjs(next).year();
    setSelectedYear(newYear);

    // Se não tem transações no próximo mês, duplicar do mês atual
    if (!hasTransactions) {
      await duplicateTransactions(selectedMonth, next);
    }
  };

  const handleToday = () => {
    const today = dayjs();
    setSelectedMonth(today.format('YYYY-MM'));
    setSelectedYear(today.year());
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevMonth}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        onClick={handleToday}
        className="min-w-[120px] font-semibold capitalize"
      >
        {dayjs(selectedMonth).format('MMMM')}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
