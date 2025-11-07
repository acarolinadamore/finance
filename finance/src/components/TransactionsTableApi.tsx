import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Edit2, Check, X, GripVertical } from "lucide-react";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useCategories,
} from "@/hooks/useApiTransactions";
import { useState, useEffect, useRef } from "react";
import type { ApiTransaction } from "@/services/api";
import { CategorySelect } from "./CategorySelect";
import { CategoryManager } from "./CategoryManager";
import { reorderTransactions } from "@/services/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useFinanceStore } from "@/store/useFinanceStore";

type ColumnId = 'due_date' | 'closing_date' | 'description' | 'category' | 'card' | 'amount' | 'estimated_amount' | 'type' | 'status';

interface ColumnConfig {
  id: ColumnId;
  label: string;
  render: (transaction: ApiTransaction, isEditing: boolean, editForm: Partial<ApiTransaction>, onChange: (field: string, value: any) => void) => React.ReactNode;
}

const STORAGE_KEY = 'finance-columns-order';

export function TransactionsTableApi() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const { data: transactions, isLoading } = useTransactions();
  const { data: categories } = useCategories();
  const { cards, updateCardMonthlyExpense, selectedMonth } = useFinanceStore();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const queryClient = useQueryClient();


  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ApiTransaction>>({});
  const [draggedColumn, setDraggedColumn] = useState<ColumnId | null>(null);
  const [draggedRow, setDraggedRow] = useState<number | null>(null);
  const [localTransactions, setLocalTransactions] = useState<ApiTransaction[]>([]);

  // Definição das colunas
  const allColumns: ColumnConfig[] = [
    {
      id: 'due_date',
      label: 'Vencimento',
      render: (t, isEditing, form, onChange) =>
        isEditing ? (
          <Input
            type="date"
            value={form.due_date || ''}
            onChange={(e) => onChange('due_date', e.target.value)}
            className="w-full"
          />
        ) : (
          t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR') : '-'
        ),
    },
    {
      id: 'closing_date',
      label: 'Fechamento',
      render: (t, isEditing, form, onChange) =>
        isEditing ? (
          <Input
            type="date"
            value={form.closing_date || ''}
            onChange={(e) => onChange('closing_date', e.target.value)}
            className="w-full"
          />
        ) : (
          t.closing_date ? new Date(t.closing_date).toLocaleDateString('pt-BR') : '-'
        ),
    },
    {
      id: 'description',
      label: 'Descrição',
      render: (t, isEditing, form, onChange) => {
        // Se categoria é cartão de crédito, mostrar select de cartões
        const isCardTransaction = form.category?.toLowerCase().includes('cartão') ||
                                 form.category?.toLowerCase().includes('credito') ||
                                 t.category?.toLowerCase().includes('cartão') ||
                                 t.category?.toLowerCase().includes('credito');

        if (isEditing && isCardTransaction) {
          return (
            <Select
              value={form.card_id || ''}
              onValueChange={(value) => {
                console.log('🎯 Card selected:', value);
                const selectedCard = cards.find(c => c.id === value);
                onChange('card_id', value);
                if (selectedCard) {
                  onChange('description', selectedCard.nickname);
                }
                console.log('✅ Form updated with card_id:', value);
              }}
            >
              <SelectTrigger className="w-full min-w-[200px]">
                <SelectValue placeholder="Selecione o cartão" />
              </SelectTrigger>
              <SelectContent>
                {cards && cards.length > 0 ? cards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${card.color || '#8B5CF6'}20`,
                        color: card.color || '#8B5CF6',
                      }}
                    >
                      {card.nickname}
                    </span>
                  </SelectItem>
                )) : (
                  <SelectItem value="no-cards" disabled>
                    Nenhum cartão cadastrado
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          );
        }

        return isEditing ? (
          <Input
            value={form.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            className="w-full min-w-[200px]"
          />
        ) : (
          t.description || '-'
        );
      },
    },
    {
      id: 'category',
      label: 'Categoria',
      render: (t, isEditing, form, onChange) => {
        if (isEditing) {
          return (
            <CategorySelect
              value={form.category || ''}
              onChange={(value) => onChange('category', value)}
            />
          );
        }
        const category = categories?.find((c) => c.name === t.category);
        return (
          <span
            className="px-2 py-1 rounded text-xs font-medium text-left inline-block"
            style={{
              backgroundColor: category ? `${category.color}20` : '#6B728020',
              color: category?.color || '#6B7280',
            }}
          >
            {t.category || '-'}
          </span>
        );
      },
    },
    {
      id: 'amount',
      label: 'Valor',
      render: (t, isEditing, form, onChange) =>
        isEditing ? (
          <Input
            type="number"
            step="0.01"
            value={form.amount || 0}
            onChange={(e) => onChange('amount', parseFloat(e.target.value))}
            className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        ) : (
          <span
            className={
              t.type === 'income'
                ? 'text-green-600 font-semibold'
                : 'text-red-600 font-semibold'
            }
          >
            R$ {t.amount ? parseFloat(t.amount as any).toFixed(2) : '0.00'}
          </span>
        ),
    },
    {
      id: 'estimated_amount',
      label: 'Valor Estimado',
      render: (t, isEditing, form, onChange) =>
        isEditing ? (
          <Input
            type="number"
            step="0.01"
            value={form.estimated_amount || 0}
            onChange={(e) => onChange('estimated_amount', parseFloat(e.target.value))}
            className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        ) : (
          <span
            className={
              t.type === 'income'
                ? 'text-green-600/70 font-semibold'
                : 'text-red-600/70 font-semibold'
            }
          >
            R$ {t.estimated_amount ? parseFloat(t.estimated_amount as any).toFixed(2) : '0.00'}
          </span>
        ),
    },
    {
      id: 'type',
      label: 'Tipo',
      render: (t, isEditing, form, onChange) =>
        isEditing ? (
          <Select
            value={form.type || 'expense'}
            onValueChange={(value: 'income' | 'expense') => onChange('type', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Entrada</SelectItem>
              <SelectItem value="expense">Saída</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span
            className={`px-2 py-1 rounded text-xs text-left inline-block ${
              t.type === 'income'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {t.type === 'income' ? 'Entrada' : 'Saída'}
          </span>
        ),
    },
    {
      id: 'status',
      label: 'Situação',
      render: (t, isEditing, form, onChange) =>
        isEditing ? (
          <Select
            value={form.status || 'pending'}
            onValueChange={(value: 'pending' | 'paid' | 'overdue') => onChange('status', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="overdue">Em Atraso</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span
            className={`px-2 py-1 rounded text-xs font-medium text-left inline-block ${
              t.status === 'paid'
                ? 'bg-green-100 text-green-700'
                : t.status === 'overdue'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {t.status === 'paid' ? 'Pago' : t.status === 'overdue' ? 'Em Atraso' : 'Pendente'}
          </span>
        ),
    },
  ];

  // Estado das colunas com ordem personalizável
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return allColumns.map(c => c.id);
      }
    }
    return allColumns.map(c => c.id);
  });

  // Salvar ordem no localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnOrder));
  }, [columnOrder]);

  // Sincronizar transações locais e filtrar por mês selecionado
  useEffect(() => {
    if (transactions && selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      const filtered = transactions.filter(t => {
        if (!t.due_date) return false;
        const date = new Date(t.due_date);
        const transMonth = date.getMonth() + 1; // getMonth() retorna 0-11
        const transYear = date.getFullYear();
        return transMonth === month && transYear === year;
      });
      setLocalTransactions(filtered);
    }
  }, [transactions, selectedMonth]);

  // Colunas ordenadas
  const orderedColumns = columnOrder
    .map(id => allColumns.find(c => c.id === id))
    .filter(Boolean) as ColumnConfig[];

  const handleAddTransaction = () => {
    // Usar o mês/ano selecionado para preencher a data inicial
    const [year, month] = selectedMonth.split('-');
    const defaultDate = `${year}-${month}-01`; // Primeiro dia do mês selecionado

    createMutation.mutate({
      due_date: defaultDate,
      description: 'Nova transação',
      category: categories?.[0]?.name || 'Geral',
      amount: 0,
      type: 'expense',
      status: 'pending',
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta transação?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (transaction: ApiTransaction) => {
    setEditingId(transaction.id!);
    setEditForm({
      due_date: transaction.due_date ? transaction.due_date.split('T')[0] : '',
      closing_date: transaction.closing_date ? transaction.closing_date.split('T')[0] : '',
      description: transaction.description,
      category: transaction.category,
      card_id: transaction.card_id,
      amount: transaction.amount ? parseFloat(transaction.amount as any) : 0,
      estimated_amount: transaction.estimated_amount ? parseFloat(transaction.estimated_amount as any) : 0,
      type: transaction.type,
      status: transaction.status || 'pending',
    });
  };

  const handleSaveEdit = () => {
    if (editingId) {
      console.log('💾 Saving transaction:', editForm);

      const dataToSave = {
        ...editForm,
        due_date: editForm.due_date || null,
        closing_date: editForm.closing_date || null,
      };

      updateMutation.mutate(
        { id: editingId, data: dataToSave },
        {
          onSuccess: () => {
            console.log('✅ Transaction saved to database');

            // Sincronizar com tabela mensal se for transação de cartão de crédito
            const isCardTransaction = editForm.category?.toLowerCase().includes('cartão') ||
                                     editForm.category?.toLowerCase().includes('credito');

            if (isCardTransaction && editForm.card_id && editForm.due_date) {
              const date = new Date(editForm.due_date);
              const month = date.getMonth();
              const year = date.getFullYear();
              const amount = editForm.amount || 0;
              console.log('🔄 Syncing to monthly table:', { card_id: editForm.card_id, year, month, amount });
              updateCardMonthlyExpense(editForm.card_id, year, month, amount);
              console.log('✨ Done! Check the Cartões de Crédito tab now!');
            } else {
              console.log('⚠️ Not syncing because:', {
                isCardTransaction,
                hasCardId: !!editForm.card_id,
                hasDueDate: !!editForm.due_date
              });
            }

            setEditingId(null);
            setEditForm({});
          },
        }
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditForm(prev => {
      const updated = { ...prev, [field]: value };
      console.log('📝 Field updated:', field, '=', value);
      return updated;
    });
  };

  // Drag and Drop handlers para colunas
  const handleDragStart = (e: React.DragEvent, columnId: ColumnId) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: ColumnId) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDraggedColumn(null);
      return;
    }

    const draggedIndex = columnOrder.indexOf(draggedColumn);
    const targetIndex = columnOrder.indexOf(targetColumnId);

    const newOrder = [...columnOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);

    setColumnOrder(newOrder);
    setDraggedColumn(null);
  };

  // Drag and Drop handlers para linhas
  const handleRowDragStart = (e: React.DragEvent, transactionId: number) => {
    setDraggedRow(transactionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleRowDrop = async (e: React.DragEvent, targetTransactionId: number) => {
    e.preventDefault();
    if (!draggedRow || draggedRow === targetTransactionId) {
      setDraggedRow(null);
      return;
    }

    const draggedIndex = localTransactions.findIndex(t => t.id === draggedRow);
    const targetIndex = localTransactions.findIndex(t => t.id === targetTransactionId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedRow(null);
      return;
    }

    // Reordenar localmente
    const newTransactions = [...localTransactions];
    const [removed] = newTransactions.splice(draggedIndex, 1);
    newTransactions.splice(targetIndex, 0, removed);

    setLocalTransactions(newTransactions);
    setDraggedRow(null);

    // Enviar para o backend
    const orders = newTransactions.map((t, index) => ({
      id: t.id!,
      display_order: index,
    }));

    try {
      await reorderTransactions(orders);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (error) {
      setLocalTransactions(transactions || []);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando transações...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transações</h2>
        <div className="flex gap-2">
          <CategoryManager />
          <Button
            onClick={handleAddTransaction}
            disabled={createMutation.isPending}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Transação
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card relative">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-visible scrollbar-hide select-none"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-2 py-3 w-8 sticky left-0 bg-muted/50 z-10"></th>
                {orderedColumns.map((column) => (
                  <th
                    key={column.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                    className="px-4 py-3 text-left text-sm font-medium cursor-move hover:bg-muted transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      {column.label}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-sm font-medium sticky right-0 bg-muted z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]">Ações</th>
              </tr>
            </thead>
          <tbody>
            {localTransactions?.map((transaction) => {
              const isEditing = editingId === transaction.id;

              return (
                <tr
                  key={transaction.id}
                  onDragOver={handleRowDragOver}
                  onDrop={(e) => handleRowDrop(e, transaction.id!)}
                  className={`border-b hover:bg-muted/30 transition-colors ${
                    draggedRow === transaction.id ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-2 py-2 w-8 sticky left-0 bg-background z-10">
                    {!isEditing && (
                      <div
                        draggable
                        onDragStart={(e) => handleRowDragStart(e, transaction.id!)}
                        className="cursor-grab active:cursor-grabbing hover:bg-muted rounded p-1"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  {orderedColumns.map((column) => (
                    <td key={column.id} className="px-4 py-2 whitespace-nowrap">
                      {column.render(transaction, isEditing, editForm, handleFieldChange)}
                    </td>
                  ))}
                  <td className="px-4 py-2 sticky right-0 bg-background z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSaveEdit}
                          disabled={updateMutation.isPending}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.id!)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>

          {localTransactions?.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma transação encontrada. Clique em "Nova Transação" para adicionar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
