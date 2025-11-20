import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SYMPTOMS, FLOW_LABELS, type FlowLevel } from '@/types/cycle';
import { useUpsertCycleRecord } from '@/hooks/useCycle';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CycleRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: string;
  existingRecord?: {
    flow_level: FlowLevel;
    symptoms: string[];
    notes?: string;
  };
}

export function CycleRecordDialog({ open, onOpenChange, date, existingRecord }: CycleRecordDialogProps) {
  const [selectedDate, setSelectedDate] = useState(date || format(new Date(), 'yyyy-MM-dd'));
  const [flowLevel, setFlowLevel] = useState<FlowLevel>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const upsertMutation = useUpsertCycleRecord();

  useEffect(() => {
    if (date) {
      setSelectedDate(date);
    } else {
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [date, open]);

  useEffect(() => {
    if (existingRecord) {
      setFlowLevel(existingRecord.flow_level);
      setSelectedSymptoms(existingRecord.symptoms || []);
      setNotes(existingRecord.notes || '');
    } else {
      setFlowLevel('none');
      setSelectedSymptoms([]);
      setNotes('');
    }
  }, [existingRecord, open]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    if (!selectedDate) return;

    await upsertMutation.mutateAsync({
      record_date: selectedDate,
      flow_level: flowLevel,
      symptoms: selectedSymptoms,
      notes: notes.trim() || undefined,
    });

    onOpenChange(false);
  };

  const recordDate = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Registrar Dia de Fluxo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="record-date" className="text-base font-semibold mb-2 block">Data</Label>
            <Input
              id="record-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {format(recordDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Fluxo</Label>
            <RadioGroup value={flowLevel} onValueChange={(value) => setFlowLevel(value as FlowLevel)}>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(FLOW_LABELS) as FlowLevel[]).map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <RadioGroupItem value={level} id={level} />
                    <Label htmlFor={level} className="cursor-pointer flex-1">
                      {FLOW_LABELS[level]}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Sintomas</Label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((symptom) => (
                <Badge
                  key={symptom}
                  variant={selectedSymptoms.includes(symptom) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleSymptom(symptom)}
                >
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-base font-semibold mb-3 block">
              Observações
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: acordei cansada, desejo por chocolate..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
