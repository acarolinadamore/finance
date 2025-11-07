import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useFinanceStore } from "@/store/useFinanceStore";
import type { Transaction } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";

const columnHelper = createColumnHelper<Transaction>();

export const TransactionsTable = () => {
  const {
    transactions,
    selectedMonth,
    categories,
    accounts,
    cards,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useFinanceStore();

  const [editingCell, setEditingCell] = useState<{
    row: number;
    column: string;
  } | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => t.competence === selectedMonth);
  }, [transactions, selectedMonth]);

  const handleAddTransaction = () => {
    addTransaction({
      type: 'saida',
      name: 'Nova transação',
      amount: 0,
      competence: selectedMonth,
      status: 'previsto',
      effective_date: dayjs().format('YYYY-MM-DD'),
    });
    toast.success('Transação adicionada');
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast.success('Transação removida');
  };

  const columns = [
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteTransaction(row.original.id)}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    }),
    columnHelper.accessor('status', {
      header: '✓',
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.status === 'efetivado'}
          onCheckedChange={(checked) => {
            updateTransaction(row.original.id, {
              status: checked ? 'efetivado' : 'previsto',
            });
          }}
        />
      ),
    }),
    columnHelper.accessor('effective_date', {
      header: 'Data',
      cell: ({ row, getValue }) => (
        <Input
          type="date"
          value={getValue() || ''}
          onChange={(e) => {
            updateTransaction(row.original.id, {
              effective_date: e.target.value,
            });
          }}
          className="w-32"
        />
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Tipo',
      cell: ({ row, getValue }) => (
        <Select
          value={getValue()}
          onValueChange={(value: 'entrada' | 'saida') => {
            updateTransaction(row.original.id, { type: value });
          }}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="saida">Saída</SelectItem>
          </SelectContent>
        </Select>
      ),
    }),
    columnHelper.accessor('category_id', {
      header: 'Categoria',
      cell: ({ row, getValue }) => (
        <Select
          value={getValue() || ''}
          onValueChange={(value) => {
            updateTransaction(row.original.id, { category_id: value });
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.parent_id ? '  └ ' : ''}{cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    }),
    columnHelper.accessor('name', {
      header: 'Nome',
      cell: ({ row, getValue }) => (
        <Input
          value={getValue()}
          onChange={(e) => {
            updateTransaction(row.original.id, { name: e.target.value });
          }}
          className="min-w-[200px]"
        />
      ),
    }),
    columnHelper.accessor('amount', {
      header: 'Valor',
      cell: ({ row, getValue }) => (
        <Input
          type="number"
          step="0.01"
          value={getValue()}
          onChange={(e) => {
            updateTransaction(row.original.id, {
              amount: parseFloat(e.target.value) || 0,
            });
          }}
          className="w-32"
        />
      ),
    }),
    columnHelper.accessor('payment_method', {
      header: 'Forma de Pagamento',
      cell: ({ row, getValue }) => (
        <Select
          value={getValue() || ''}
          onValueChange={(value) => {
            updateTransaction(row.original.id, { payment_method: value as any });
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="cartao_credito">Cartão Crédito</SelectItem>
            <SelectItem value="cartao_debito">Cartão Débito</SelectItem>
            <SelectItem value="boleto">Boleto</SelectItem>
            <SelectItem value="transferencia">Transferência</SelectItem>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="ted_doc">TED/DOC</SelectItem>
          </SelectContent>
        </Select>
      ),
    }),
    columnHelper.accessor('note', {
      header: 'Observação',
      cell: ({ row, getValue }) => (
        <Input
          value={getValue() || ''}
          onChange={(e) => {
            updateTransaction(row.original.id, { note: e.target.value });
          }}
          placeholder="Observação..."
          className="min-w-[150px]"
        />
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transações</h2>
        <Button onClick={handleAddTransaction} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Nenhuma transação neste mês. Clique em "Nova Transação" para adicionar.
          </div>
        )}
      </div>
    </div>
  );
};
