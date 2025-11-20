import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useUpsertCycleSettings, useCycleSettings } from '@/hooks/useCycle';

interface CycleSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CycleSettingsDialog({ open, onOpenChange }: CycleSettingsDialogProps) {
  const { data: settings } = useCycleSettings();
  const upsertMutation = useUpsertCycleSettings();

  const [lastPeriodStartDate, setLastPeriodStartDate] = useState('');
  const [averageCycleLength, setAverageCycleLength] = useState(28);
  const [averagePeriodLength, setAveragePeriodLength] = useState(5);
  const [lutealPhaseLength, setLutealPhaseLength] = useState(14);

  useEffect(() => {
    if (settings) {
      setLastPeriodStartDate(settings.last_period_start_date);
      setAverageCycleLength(settings.average_cycle_length);
      setAveragePeriodLength(settings.average_period_length);
      setLutealPhaseLength(settings.luteal_phase_length);
    }
  }, [settings]);

  const handleSave = async () => {
    await upsertMutation.mutateAsync({
      last_period_start_date: lastPeriodStartDate,
      average_cycle_length: averageCycleLength,
      average_period_length: averagePeriodLength,
      luteal_phase_length: lutealPhaseLength,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações do Ciclo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="lastPeriod">Primeiro dia da última menstruação</Label>
            <Input
              id="lastPeriod"
              type="date"
              value={lastPeriodStartDate}
              onChange={(e) => setLastPeriodStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="cycleLength">Duração média do ciclo (dias)</Label>
            <Input
              id="cycleLength"
              type="number"
              min="21"
              max="45"
              value={averageCycleLength}
              onChange={(e) => setAverageCycleLength(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Normalmente entre 21 e 35 dias
            </p>
          </div>

          <div>
            <Label htmlFor="periodLength">Duração média da menstruação (dias)</Label>
            <Input
              id="periodLength"
              type="number"
              min="2"
              max="10"
              value={averagePeriodLength}
              onChange={(e) => setAveragePeriodLength(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Normalmente entre 3 e 7 dias
            </p>
          </div>

          <div>
            <Label htmlFor="lutealPhase">Duração da fase lútea (dias)</Label>
            <Input
              id="lutealPhase"
              type="number"
              min="10"
              max="16"
              value={lutealPhaseLength}
              onChange={(e) => setLutealPhaseLength(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Padrão: 14 dias (ajustável entre 10-16)
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!lastPeriodStartDate || upsertMutation.isPending}
            >
              {upsertMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
