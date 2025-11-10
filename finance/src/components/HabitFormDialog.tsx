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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Habit, Period, Frequency, PERIOD_LABELS, WeekDay } from '@/types/routine';
import { format } from 'date-fns';

interface HabitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingHabit?: Habit | null;
}

const ICON_OPTIONS = ['💪', '📖', '🧘', '☕', '🥗', '🚶', '💤', '📧', '🎯', '✨', '🎨', '🎵', '📝', '💧'];

const WEEK_DAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export const HabitFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editingHabit,
}: HabitFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    period: '' as Period | '',
    frequency: 'daily' as Frequency,
    specificDays: [] as WeekDay[],
    timesPerWeek: undefined as number | undefined,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    icon: '',
    color: '#8b5cf6',
    isActive: true,
  });

  useEffect(() => {
    if (editingHabit) {
      setFormData({
        name: editingHabit.name,
        period: editingHabit.period || '',
        frequency: editingHabit.frequency,
        specificDays: editingHabit.specificDays || [],
        timesPerWeek: editingHabit.timesPerWeek,
        startDate: editingHabit.startDate,
        endDate: editingHabit.endDate || '',
        icon: editingHabit.icon || '',
        color: editingHabit.color || '#8b5cf6',
        isActive: editingHabit.isActive,
      });
    } else {
      setFormData({
        name: '',
        period: '',
        frequency: 'daily',
        specificDays: [],
        timesPerWeek: undefined,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
        icon: '',
        color: '#8b5cf6',
        isActive: true,
      });
    }
  }, [editingHabit, open]);

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    onSubmit({
      name: formData.name,
      period: formData.period || undefined,
      frequency: formData.frequency,
      specificDays: formData.specificDays.length > 0 ? formData.specificDays : undefined,
      timesPerWeek: formData.timesPerWeek,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      icon: formData.icon || undefined,
      color: formData.color,
      isActive: formData.isActive,
    });
    onOpenChange(false);
  };

  const toggleWeekDay = (day: WeekDay) => {
    setFormData((prev) => ({
      ...prev,
      specificDays: prev.specificDays.includes(day)
        ? prev.specificDays.filter((d) => d !== day)
        : [...prev.specificDays, day].sort(),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingHabit ? 'Editar Hábito' : 'Adicionar Hábito'}
          </DialogTitle>
          <DialogDescription>
            {editingHabit
              ? 'Atualize as informações do seu hábito'
              : 'Cadastre um novo hábito para acompanhar'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Hábito *</Label>
            <Input
              id="name"
              placeholder="Ex: Meditar 10 minutos"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label htmlFor="period">
              Período Sugerido{' '}
              <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Select
              value={formData.period}
              onValueChange={(value: Period) =>
                setFormData({ ...formData, period: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
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
                {WEEK_DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWeekDay(day.value as WeekDay)}
                    className={`
                      flex-1 py-2 px-1 text-xs font-medium rounded-md transition-colors
                      ${
                        formData.specificDays.includes(day.value as WeekDay)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }
                    `}
                  >
                    {day.label}
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

          {/* Data de início */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Data de Início *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          {/* Data de término */}
          <div className="space-y-2">
            <Label htmlFor="endDate">
              Data de Término{' '}
              <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          {/* Ícone */}
          <div className="space-y-2">
            <Label>
              Ícone <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <div className="grid grid-cols-7 gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`p-2 text-2xl rounded-md hover:bg-muted transition-colors ${
                    formData.icon === icon ? 'bg-primary/10 ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-20 h-10"
              />
              <span className="text-sm text-muted-foreground">{formData.color}</span>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            {editingHabit ? 'Atualizar' : 'Cadastrar'} Hábito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
