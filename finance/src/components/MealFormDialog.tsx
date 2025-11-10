import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Meal,
  MealType,
  HungerLevel,
  SatisfactionLevel,
  MEAL_TYPE_LABELS,
  HUNGER_LEVEL_LABELS,
  SATISFACTION_LEVEL_LABELS,
  FoodItem,
} from '@/types/meals';
import { Plus, Trash2, Camera } from 'lucide-react';
import { format } from 'date-fns';

interface MealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (meal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingMeal?: Meal | null;
}

export const MealFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editingMeal,
}: MealFormDialogProps) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    mealType: 'lunch' as MealType,
    hungerLevel: 'little-hungry' as HungerLevel,
    satisfactionLevel: 'satisfied' as SatisfactionLevel,
    notes: '',
    photo: '',
  });

  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [newFoodItem, setNewFoodItem] = useState({ name: '', quantity: '' });

  useEffect(() => {
    if (editingMeal) {
      setFormData({
        date: editingMeal.date,
        time: editingMeal.time,
        mealType: editingMeal.mealType,
        hungerLevel: editingMeal.hungerLevel,
        satisfactionLevel: editingMeal.satisfactionLevel,
        notes: editingMeal.notes || '',
        photo: editingMeal.photo || '',
      });
      setFoodItems(editingMeal.foodItems);
    } else {
      // Reset para nova refeição
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        mealType: 'lunch',
        hungerLevel: 'little-hungry',
        satisfactionLevel: 'satisfied',
        notes: '',
        photo: '',
      });
      setFoodItems([]);
    }
  }, [editingMeal, open]);

  const handleAddFoodItem = () => {
    if (newFoodItem.name.trim()) {
      const item: FoodItem = {
        id: crypto.randomUUID(),
        name: newFoodItem.name,
        quantity: newFoodItem.quantity || '1 porção',
      };
      setFoodItems([...foodItems, item]);
      setNewFoodItem({ name: '', quantity: '' });
    }
  };

  const handleRemoveFoodItem = (id: string) => {
    setFoodItems(foodItems.filter((item) => item.id !== id));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Comprimir imagem antes de salvar
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Redimensionar para max 800px de largura
          const maxWidth = 800;
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;

          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Comprimir para 70% de qualidade
          const compressedData = canvas.toDataURL('image/jpeg', 0.7);
          setFormData({ ...formData, photo: compressedData });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const meal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'> = {
      date: formData.date,
      time: formData.time || undefined,
      mealType: formData.mealType || undefined,
      hungerLevel: formData.hungerLevel || undefined,
      satisfactionLevel: formData.satisfactionLevel || undefined,
      foodItems,
      notes: formData.notes || undefined,
      photo: formData.photo || undefined,
    };
    onSubmit(meal);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMeal ? 'Editar Refeição' : 'Registrar Refeição'}
          </DialogTitle>
          <DialogDescription>
            {editingMeal
              ? 'Atualize as informações da sua refeição'
              : 'Registre o que você comeu e como se sentiu'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">
                Hora <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
          </div>

          {/* Tipo de Refeição */}
          <div className="space-y-2">
            <Label htmlFor="mealType">
              Tipo de Refeição <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Select
              value={formData.mealType}
              onValueChange={(value: MealType) =>
                setFormData({ ...formData, mealType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MEAL_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nível de Fome */}
          <div className="space-y-2">
            <Label htmlFor="hungerLevel">
              Nível de Fome Antes <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Select
              value={formData.hungerLevel}
              onValueChange={(value: HungerLevel) =>
                setFormData({ ...formData, hungerLevel: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um nível" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(HUNGER_LEVEL_LABELS).map(([key, { label, emoji }]) => (
                  <SelectItem key={key} value={key}>
                    {emoji} {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alimentos */}
          <div className="space-y-3">
            <Label>Alimentos <span className="text-muted-foreground">(opcional)</span></Label>
            <div className="space-y-2">
              {foodItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => handleRemoveFoodItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[1fr,1fr,auto] gap-2">
              <Input
                placeholder="Ex: Arroz integral"
                value={newFoodItem.name}
                onChange={(e) =>
                  setNewFoodItem({ ...newFoodItem, name: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFoodItem();
                  }
                }}
              />
              <Input
                placeholder="Ex: 2 colheres"
                value={newFoodItem.quantity}
                onChange={(e) =>
                  setNewFoodItem({ ...newFoodItem, quantity: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFoodItem();
                  }
                }}
              />
              <Button type="button" onClick={handleAddFoodItem} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Nível de Satisfação */}
          <div className="space-y-2">
            <Label htmlFor="satisfactionLevel">
              Satisfação Após Comer <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Select
              value={formData.satisfactionLevel}
              onValueChange={(value: SatisfactionLevel) =>
                setFormData({ ...formData, satisfactionLevel: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um nível" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SATISFACTION_LEVEL_LABELS).map(
                  ([key, { label, emoji }]) => (
                    <SelectItem key={key} value={key}>
                      {emoji} {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Foto */}
          <div className="space-y-2">
            <Label htmlFor="photo">
              Foto <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('photo')?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                {formData.photo ? 'Alterar Foto' : 'Adicionar Foto'}
              </Button>
              {formData.photo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, photo: '' })}
                >
                  Remover
                </Button>
              )}
            </div>
            {formData.photo && (
              <div className="mt-2">
                <img
                  src={formData.photo}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Notas <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Como você se sentiu? Alguma observação..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            {editingMeal ? 'Atualizar' : 'Registrar'} Refeição
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
