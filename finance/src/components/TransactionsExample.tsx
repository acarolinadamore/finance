import { Button } from '@/components/ui/button';
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useSummary,
} from '@/hooks/useApiTransactions';

export function TransactionsExample() {
  // Buscar dados
  const { data: transactions, isLoading, error } = useTransactions();
  const { data: summary } = useSummary();

  // Mutations
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  // Exemplo: Criar nova transação
  const handleCreateTransaction = () => {
    createMutation.mutate({
      date: new Date().toISOString().split('T')[0],
      description: 'Nova transação',
      category: 'Alimentação',
      amount: 100.0,
      type: 'expense',
    });
  };

  // Exemplo: Atualizar transação
  const handleUpdateTransaction = (id: number) => {
    updateMutation.mutate({
      id,
      data: {
        description: 'Transação atualizada',
        amount: 150.0,
      },
    });
  };

  // Exemplo: Deletar transação
  const handleDeleteTransaction = (id: number) => {
    if (confirm('Tem certeza que deseja deletar?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Transações da API</h1>

      {/* Resumo */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-100 rounded">
            <p className="text-sm">Receitas</p>
            <p className="text-2xl font-bold">R$ {parseFloat(summary.total_income).toFixed(2)}</p>
          </div>
          <div className="p-4 bg-red-100 rounded">
            <p className="text-sm">Despesas</p>
            <p className="text-2xl font-bold">R$ {parseFloat(summary.total_expenses).toFixed(2)}</p>
          </div>
          <div className="p-4 bg-blue-100 rounded">
            <p className="text-sm">Saldo</p>
            <p className="text-2xl font-bold">R$ {parseFloat(summary.balance).toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Botão para criar */}
      <Button onClick={handleCreateTransaction} disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Criando...' : 'Criar Nova Transação'}
      </Button>

      {/* Lista de transações */}
      <div className="space-y-2">
        {transactions?.map((transaction) => (
          <div
            key={transaction.id}
            className="p-4 border rounded flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{transaction.description}</p>
              <p className="text-sm text-gray-600">
                {transaction.category} - {transaction.date}
              </p>
              <p className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                R$ {parseFloat(transaction.amount).toFixed(2)}
              </p>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateTransaction(transaction.id!)}
                disabled={updateMutation.isPending}
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteTransaction(transaction.id!)}
                disabled={deleteMutation.isPending}
              >
                Deletar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
