import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Routine, FREQUENCY_LABELS } from '@/types/routine';

interface RoutineCardProps {
  routine: Routine;
  isCompleted: boolean;
  onToggle: () => void;
  onEdit: (routine: Routine) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: any;
}

export const RoutineCard = ({
  routine,
  isCompleted,
  onToggle,
  onEdit,
  onDelete,
  dragHandleProps,
}: RoutineCardProps) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 pt-1"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <Checkbox
        checked={isCompleted}
        onCheckedChange={onToggle}
        className="mt-0.5 h-5 w-5 rounded-full data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {routine.icon && <span className="text-lg">{routine.icon}</span>}
          <p
            className={`text-sm font-medium ${
              isCompleted ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {routine.name}
          </p>
        </div>

        {routine.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {routine.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {FREQUENCY_LABELS[routine.frequency]}
          </Badge>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(routine)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(routine.id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
