import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useTransactions, useDeleteTransaction } from "@/hooks/useApiTransactions";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

export const DeleteMonthTransactions = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { selectedMonth, cards, updateCardMonthlyExpense } = useFinanceStore();
  const { data: transactions } = useTransactions();
  const deleteMutation = useDeleteTransaction();

  const getMonthTransactions = () => {
    if (!transactions || !selectedMonth) return [];

    const [year, month] = selectedMonth.split('-').map(Number);
    return transactions.filter(t => {
      if (!t.due_date) return false;
      const date = new Date(t.due_date);
      const transMonth = date.getMonth() + 1;
      const transYear = date.getFullYear();
      return transMonth === month && transYear === year;
    });
  };

  const handleDeleteAll = async () => {
    const monthTransactions = getMonthTransactions();

    if (monthTransactions.length === 0) {
      setShowDialog(false);
      return;
    }

    const [year, month] = selectedMonth.split('-').map(Number);

    // Excluir todas as transações
    for (const transaction of monthTransactions) {
      try {
        await deleteMutation.mutateAsync(transaction.id!);
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
      }
    }

    // Zerar TODOS os cartões deste mês (independente se tinham transações ou não)
    // Isso garante que os valores estimados e reais sejam zerados
    cards.forEach((card) => {
      updateCardMonthlyExpense(card.id, year, month - 1, 0);
    });

    setShowDialog(false);
  };

  const monthTransactionsCount = getMonthTransactions().length;
  const monthName = dayjs(selectedMonth).format('MMMM');

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDialog(true)}
        className="h-9 w-9 text-muted-foreground hover:text-destructive"
        title="Excluir todas transações do mês"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Tem certeza que deseja excluir <strong>todas as {monthTransactionsCount} transações</strong> do mês de <strong className="capitalize">{monthName}</strong>?
                </p>
                <p className="text-destructive font-semibold">
                  Esta ação não pode ser desfeita!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
