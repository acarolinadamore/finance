import { useState } from "react";
import { Plus, Trash2, CreditCard, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinanceStore } from "@/store/useFinanceStore";
import type { Card } from "@/types/finance";

const PRESET_COLORS = [
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
  '#6366F1', // indigo
];

export function CardManager() {
  const { cards, addCard, updateCard, deleteCard } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [newCardData, setNewCardData] = useState({
    nickname: "",
    brand: "",
    closing_day: 1,
    due_day: 10,
    credit_limit: 0,
    color: PRESET_COLORS[0],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Card>>({});

  const handleCreate = () => {
    if (newCardData.nickname.trim()) {
      addCard({
        ...newCardData,
        nickname: newCardData.nickname.trim(),
        account_id: "", // Não é mais obrigatório
      });
      setNewCardData({
        nickname: "",
        brand: "",
        closing_day: 1,
        due_day: 10,
        credit_limit: 0,
        color: PRESET_COLORS[0],
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este cartão?")) {
      deleteCard(id);
    }
  };

  const handleEdit = (card: Card) => {
    setEditingId(card.id);
    setEditingData({
      nickname: card.nickname,
      color: card.color || PRESET_COLORS[0],
      brand: card.brand,
      closing_day: card.closing_day,
      due_day: card.due_day,
      credit_limit: card.credit_limit,
    });
  };

  const handleSaveEdit = (id: string) => {
    if (!editingData.nickname?.trim()) return;

    updateCard(id, editingData);
    setEditingId(null);
    setEditingData({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Gerenciar Cartões
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Cartões</DialogTitle>
          <DialogDescription>
            Crie e gerencie seus cartões de crédito
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Criar novo cartão */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Novo Cartão</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="card-nickname">Nome do Cartão *</Label>
                <Input
                  id="card-nickname"
                  value={newCardData.nickname}
                  onChange={(e) =>
                    setNewCardData({ ...newCardData, nickname: e.target.value })
                  }
                  placeholder="Ex: Nubank Principal, Cartão Itaú..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                  }}
                />
              </div>

              <div>
                <Label htmlFor="card-brand">Bandeira (opcional)</Label>
                <Input
                  id="card-brand"
                  value={newCardData.brand}
                  onChange={(e) =>
                    setNewCardData({ ...newCardData, brand: e.target.value })
                  }
                  placeholder="Ex: Visa, Mastercard..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="card-closing">Dia Fechamento *</Label>
                  <Input
                    id="card-closing"
                    type="number"
                    min="1"
                    max="31"
                    value={newCardData.closing_day}
                    onChange={(e) =>
                      setNewCardData({
                        ...newCardData,
                        closing_day: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="card-due">Dia Vencimento *</Label>
                  <Input
                    id="card-due"
                    type="number"
                    min="1"
                    max="31"
                    value={newCardData.due_day}
                    onChange={(e) =>
                      setNewCardData({
                        ...newCardData,
                        due_day: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="card-limit">Limite *</Label>
                  <Input
                    id="card-limit"
                    type="number"
                    step="0.01"
                    value={newCardData.credit_limit}
                    onChange={(e) =>
                      setNewCardData({
                        ...newCardData,
                        credit_limit: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Cor (opcional)</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setNewCardData(prev => ({ ...prev, color: color }));
                      }}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newCardData.color === color
                          ? 'ring-2 ring-offset-2 ring-primary scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreate}
                disabled={!newCardData.nickname.trim()}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar Cartão
              </Button>
            </div>
          </div>

          {/* Lista de cartões */}
          <div className="space-y-2">
            <h3 className="font-semibold">Cartões Existentes</h3>
            <div className="grid gap-2">
              {cards.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum cartão cadastrado. Crie um acima.
                </p>
              ) : (
                cards
                  .sort((a, b) => a.nickname.localeCompare(b.nickname))
                  .map((card) => {
                    const isEditing = editingId === card.id;

                    return (
                      <div
                        key={card.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            {isEditing ? (
                              <>
                                <Input
                                  value={editingData.nickname || ""}
                                  onChange={(e) =>
                                    setEditingData({
                                      ...editingData,
                                      nickname: e.target.value,
                                    })
                                  }
                                  placeholder="Nome do cartão"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit(card.id);
                                    if (e.key === 'Escape') handleCancelEdit();
                                  }}
                                  autoFocus
                                />
                                <Input
                                  value={editingData.brand || ""}
                                  onChange={(e) =>
                                    setEditingData({
                                      ...editingData,
                                      brand: e.target.value,
                                    })
                                  }
                                  placeholder="Bandeira (opcional)"
                                />
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="px-3 py-1.5 rounded text-sm font-medium"
                                    style={{
                                      backgroundColor: `${card.color || PRESET_COLORS[0]}20`,
                                      color: card.color || PRESET_COLORS[0],
                                    }}
                                  >
                                    {card.nickname}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  {card.brand && <p>Bandeira: {card.brand}</p>}
                                  <p>
                                    Fechamento: dia {card.closing_day} | Vencimento: dia{" "}
                                    {card.due_day}
                                  </p>
                                  {card.credit_limit && card.credit_limit > 0 && (
                                    <p>
                                      Limite: R$ {card.credit_limit.toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleSaveEdit(card.id)}
                                  disabled={!editingData.nickname?.trim()}
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(card)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(card.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Seletor de cores quando editando */}
                        {isEditing && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <Label className="text-xs">Escolher nova cor</Label>
                            <div className="flex gap-2 flex-wrap">
                              {PRESET_COLORS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingData(prev => ({ ...prev, color: color }));
                                  }}
                                  className={`w-8 h-8 rounded-full transition-all ${
                                    editingData.color === color
                                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                                      : 'hover:scale-105'
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <div className="mt-2">
                              <span
                                className="px-3 py-1.5 rounded text-sm font-medium inline-block"
                                style={{
                                  backgroundColor: `${editingData.color || card.color || PRESET_COLORS[0]}20`,
                                  color: editingData.color || card.color || PRESET_COLORS[0],
                                }}
                              >
                                {editingData.nickname || card.nickname}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
