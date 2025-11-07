import { useState } from "react";
import { Plus, Trash2, Palette, Edit2, Check, X } from "lucide-react";
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
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/useApiTransactions";

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

interface CategoryManagerProps {
  compact?: boolean;
}

export function CategoryManager({ compact = false }: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingColor, setEditingColor] = useState("");
  const [editingName, setEditingName] = useState("");

  const { data: categories } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();
  const updateMutation = useUpdateCategory();

  const handleCreate = () => {
    if (newCategoryName.trim()) {
      createMutation.mutate(
        {
          name: newCategoryName.trim(),
          color: selectedColor,
        },
        {
          onSuccess: () => {
            setNewCategoryName("");
            setSelectedColor(PRESET_COLORS[0]);
          },
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta categoria?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (id: number, currentName: string, currentColor: string) => {
    setEditingId(id);
    setEditingName(currentName);
    setEditingColor(currentColor);
  };

  const handleSaveEdit = (id: number) => {
    if (!editingName.trim()) return;

    updateMutation.mutate(
      { id, data: { name: editingName.trim(), color: editingColor } },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditingName("");
          setEditingColor("");
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingColor("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button variant="outline" size="icon" className="flex-shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <Palette className="h-4 w-4" />
            Gerenciar Categorias
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>
            Crie e gerencie suas categorias de transações
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Criar nova categoria */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Nova Categoria</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="category-name">Nome da Categoria</Label>
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Alimentação, Transporte..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                  }}
                />
              </div>

              <div>
                <Label>Cor</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        selectedColor === color
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
                disabled={!newCategoryName.trim() || createMutation.isPending}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                {createMutation.isPending ? 'Criando...' : 'Criar Categoria'}
              </Button>
            </div>
          </div>

          {/* Lista de categorias */}
          <div className="space-y-2">
            <h3 className="font-semibold">Categorias Existentes</h3>
            <div className="grid gap-2">
              {categories
                ?.sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => {
                  const isEditing = editingId === category.id;

                  return (
                    <div
                      key={category.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        {isEditing ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(category.id!);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="px-3 py-1.5 rounded text-sm font-medium"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color,
                            }}
                          >
                            {category.name}
                          </span>
                        )}
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSaveEdit(category.id!)}
                                disabled={updateMutation.isPending || !editingName.trim()}
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
                                onClick={() => handleEdit(category.id!, category.name, category.color)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(category.id!)}
                                disabled={deleteMutation.isPending}
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
                                onClick={() => setEditingColor(color)}
                                className={`w-8 h-8 rounded-full transition-all ${
                                  editingColor === color
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
                                backgroundColor: `${editingColor}20`,
                                color: editingColor,
                              }}
                            >
                              {editingName || category.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
