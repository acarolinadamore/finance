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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Routine,
  Period,
  Frequency,
  RoutineType,
  PERIOD_LABELS,
  FREQUENCY_LABELS,
  ROUTINE_TYPE_LABELS,
} from '@/types/routine';

interface RoutineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingRoutine?: Routine | null;
  defaultPeriod?: Period;
}

const ICON_OPTIONS = ['📅', '💪', '📖', '🧘', '☕', '🥗', '🚶', '💤', '📧', '🎯', '✨', '🎨', '🎵', '📝'];

export const RoutineFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editingRoutine,
  defaultPeriod,
}: RoutineFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    period: (defaultPeriod || 'morning') as Period,
    frequency: 'daily' as Frequency,
    specificDays: [] as number[],
    timesPerWeek: undefined as number | undefined,
    icon: '',
    isActive: true,
    addToHabitTracking: false,
  });

  useEffect(() => {
    if (editingRoutine) {
      console.log('🔍 [RoutineFormDialog] editingRoutine recebido:', editingRoutine);
      console.log('🔍 [RoutineFormDialog] addToHabitTracking:', editingRoutine.addToHabitTracking);
      console.log('🔍 [RoutineFormDialog] add_to_habit_tracking:', (editingRoutine as any).add_to_habit_tracking);

      setFormData({
        name: editingRoutine.name,
        description: editingRoutine.description || '',
        period: editingRoutine.period,
        frequency: editingRoutine.frequency,
        specificDays: (editingRoutine as any).specificDays || [],
        timesPerWeek: (editingRoutine as any).timesPerWeek,
        icon: editingRoutine.icon || '',
        isActive: editingRoutine.isActive,
        addToHabitTracking: editingRoutine.addToHabitTracking || (editingRoutine as any).add_to_habit_tracking || false,
      });

      console.log('✅ [RoutineFormDialog] formData.addToHabitTracking definido como:', editingRoutine.addToHabitTracking || (editingRoutine as any).add_to_habit_tracking || false);
    } else {
      setFormData({
        name: '',
        description: '',
        period: defaultPeriod || 'morning',
        frequency: 'daily',
        specificDays: [],
        timesPerWeek: undefined,
        icon: '',
        isActive: true,
        addToHabitTracking: false,
      });
    }
  }, [editingRoutine, defaultPeriod, open]);

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const dataToSubmit = {
      ...formData,
      icon: formData.icon || undefined,
      description: formData.description || undefined,
      specificDays: formData.specificDays.length > 0 ? formData.specificDays : undefined,
      timesPerWeek: formData.timesPerWeek,
    };

    console.log('📤 [RoutineFormDialog] Enviando dados:', dataToSubmit);
    console.log('📤 [RoutineFormDialog] addToHabitTracking no envio:', dataToSubmit.addToHabitTracking);

    onSubmit(dataToSubmit as any);
    onOpenChange(false);
  };

  const toggleWeekDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      specificDays: prev.specificDays.includes(day)
        ? prev.specificDays.filter((d) => d !== day)
        : [...prev.specificDays, day].sort(),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingRoutine ? 'Editar Rotina' : 'Nova Rotina'}
          </DialogTitle>
          <DialogDescription>
            {editingRoutine
              ? 'Atualize as informações da sua rotina'
              : 'Cadastre uma nova tarefa, hábito ou lembrete'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Ex: Meditar 10 minutos"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Detalhes sobre a rotina..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
            />
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label htmlFor="period">Período *</Label>
            <Select
              value={formData.period}
              onValueChange={(value: Period) =>
                setFormData({ ...formData, period: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERIOD_LABELS).map(([key, { label, emoji }]) => (
                  <SelectItem key={key} value={key}>
                    {emoji} {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequência */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequência *</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value: Frequency) =>
                setFormData({ ...formData, frequency: value as Frequency })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diariamente</SelectItem>
                <SelectItem value="weekly">Dias específicos da semana</SelectItem>
                <SelectItem value="once">X vezes por semana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dias específicos (se weekly) */}
          {formData.frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Dias da Semana *</Label>
              <div className="flex gap-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleWeekDay(index)}
                    className={`
                      flex-1 py-2 px-1 text-xs font-medium rounded-md transition-colors
                      ${
                        formData.specificDays.includes(index)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }
                    `}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* X vezes por semana */}
          {formData.frequency === 'once' && (
            <div className="space-y-2">
              <Label htmlFor="timesPerWeek">Vezes por Semana *</Label>
              <Input
                id="timesPerWeek"
                type="number"
                min="1"
                max="7"
                placeholder="Ex: 3"
                value={formData.timesPerWeek || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timesPerWeek: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>
          )}

          {/* Adicionar ao controle de hábitos */}
          <div
            className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => {
              console.log('🖱️ [Div] Clique na div detectado');
              const newValue = !formData.addToHabitTracking;
              console.log('🔘 [Checkbox] Mudança:', formData.addToHabitTracking, '→', newValue);
              setFormData({ ...formData, addToHabitTracking: newValue });
            }}
          >
            <Checkbox
              id="addToHabitTracking"
              checked={formData.addToHabitTracking}
              onCheckedChange={(checked) => {
                console.log('🔘 [Checkbox] onCheckedChange chamado:', checked);
              }}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor="addToHabitTracking"
                className="cursor-pointer font-medium text-sm"
              >
                Adicionar ao controle de hábitos
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Esta rotina aparecerá na aba Hábitos para acompanhamento mensal
              </p>
            </div>
          </div>

          {/* Debug do estado */}
          <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
            Estado atual: addToHabitTracking = {formData.addToHabitTracking ? '✅ true' : '❌ false'}
          </div>

          <Button onClick={handleSubmit} className="w-full">
            {editingRoutine ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
