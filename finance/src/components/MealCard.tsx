import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Pencil, Trash2, Clock, Calendar } from 'lucide-react';
import {
  Meal,
  MEAL_TYPE_LABELS,
  HUNGER_LEVEL_LABELS,
  SATISFACTION_LEVEL_LABELS,
} from '@/types/meals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MealCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (id: string) => void;
}

export const MealCard = ({ meal, onEdit, onDelete }: MealCardProps) => {
  const [imageError, setImageError] = useState(false);

  const hungerInfo = meal.hungerLevel ? HUNGER_LEVEL_LABELS[meal.hungerLevel] : null;
  const satisfactionInfo = meal.satisfactionLevel ? SATISFACTION_LEVEL_LABELS[meal.satisfactionLevel] : null;
  const mealTypeLabel = meal.mealType ? MEAL_TYPE_LABELS[meal.mealType] : 'Refeição';

  const formattedDate = format(new Date(meal.date), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {meal.mealType && (
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="text-xs font-medium"
                  style={{
                    backgroundColor: getMealTypeColor(meal.mealType),
                    color: 'white',
                    borderColor: getMealTypeColor(meal.mealType),
                  }}
                >
                  {mealTypeLabel}
                </Badge>
              </div>
            )}
            <CardTitle className="text-lg">{mealTypeLabel}</CardTitle>
            <CardDescription className="flex items-center gap-3 mt-1 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
              {meal.time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {meal.time}
                </span>
              )}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(meal)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(meal.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Foto da refeição */}
        {meal.photo && !imageError && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={meal.photo}
              alt="Foto da refeição"
              className="w-full h-48 object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Níveis de fome e satisfação */}
        {(hungerInfo || satisfactionInfo) && (
          <div className="grid grid-cols-2 gap-3">
            {hungerInfo && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Fome antes</p>
                <p className="text-sm font-medium">
                  {hungerInfo.emoji} {hungerInfo.label}
                </p>
              </div>
            )}
            {satisfactionInfo && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Após comer</p>
                <p className="text-sm font-medium">
                  {satisfactionInfo.emoji} {satisfactionInfo.label}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lista de alimentos */}
        {meal.foodItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Alimentos:
            </p>
            <div className="space-y-1">
              {meal.foodItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2 text-sm bg-muted/30 rounded-md p-2"
                >
                  <span className="text-primary">•</span>
                  <span className="flex-1">{item.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        {meal.notes && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Notas:</p>
            <p className="text-sm bg-muted/30 rounded-md p-2">{meal.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Função auxiliar para definir cores por tipo de refeição
function getMealTypeColor(mealType: string): string {
  const colors: Record<string, string> = {
    breakfast: '#f59e0b', // Amber
    'morning-snack': '#84cc16', // Lime
    lunch: '#ef4444', // Red
    'afternoon-snack': '#06b6d4', // Cyan
    dinner: '#8b5cf6', // Violet
    'evening-snack': '#6366f1', // Indigo
    'off-hours': '#f43f5e', // Rose (vermelho rosado para "escapadinha")
  };
  return colors[mealType] || '#6b7280';
}
