import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Heart } from 'lucide-react';

interface CalendarModule {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface CalendarSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibleModules: string[];
  onVisibleModulesChange: (modules: string[]) => void;
}

const AVAILABLE_MODULES: CalendarModule[] = [
  {
    id: 'cycle',
    name: 'Ciclo Feminino',
    icon: <Activity className="h-4 w-4" />,
    color: '#db2777',
  },
  {
    id: 'moods',
    name: 'Humor',
    icon: <Heart className="h-4 w-4" />,
    color: '#8b5cf6',
  },
];

export function CalendarSettingsDialog({
  open,
  onOpenChange,
  visibleModules,
  onVisibleModulesChange,
}: CalendarSettingsDialogProps) {
  const [localVisibleModules, setLocalVisibleModules] = useState<string[]>(visibleModules);

  useEffect(() => {
    setLocalVisibleModules(visibleModules);
  }, [visibleModules]);

  const toggleModule = (moduleId: string) => {
    setLocalVisibleModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSave = () => {
    onVisibleModulesChange(localVisibleModules);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações do Calendário</DialogTitle>
          <DialogDescription>
            Selecione quais módulos deseja visualizar no calendário
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">

            {AVAILABLE_MODULES.map((module) => (
              <div
                key={module.id}
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={module.id}
                  checked={localVisibleModules.includes(module.id)}
                  onCheckedChange={() => toggleModule(module.id)}
                />
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${module.color}20` }}
                >
                  <div style={{ color: module.color }}>{module.icon}</div>
                </div>
                <Label
                  htmlFor={module.id}
                  className="flex-1 cursor-pointer font-medium"
                >
                  {module.name}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
