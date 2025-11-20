import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCycleRecords, useDeleteCycleRecord } from '@/hooks/useCycle';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Plus } from 'lucide-react';
import { FLOW_LABELS } from '@/types/cycle';

interface CycleRecordsListProps {
  onRegisterClick: () => void;
}

const FLOW_COLORS = {
  none: '#9ca3af',
  light: '#fde047',
  moderate: '#fb923c',
  heavy: '#dc2626',
};

const FLOW_ICONS = {
  none: '',
  light: '🩸',
  moderate: '🩸🩸',
  heavy: '🩸🩸🩸',
};

export function CycleRecordsList({ onRegisterClick }: CycleRecordsListProps) {
  const { data: records = [] } = useCycleRecords();
  const deleteMutation = useDeleteCycleRecord();

  const recentRecords = useMemo(() => {
    return records
      .filter(r => r.flow_level !== 'none')
      .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())
      .slice(0, 10);
  }, [records]);

  const handleDelete = async (date: string) => {
    if (confirm('Deseja realmente excluir este registro?')) {
      await deleteMutation.mutateAsync(date);
    }
  };

  if (recentRecords.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Acompanhe seu ciclo menstrual com registros diários de fluxo e sintomas
            </p>
            <Button onClick={onRegisterClick} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primeiro Dia
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Registros Recentes</CardTitle>
        <Button onClick={onRegisterClick} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Registrar Dia
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentRecords.map((record) => {
            const date = new Date(record.record_date);
            const formattedDate = format(date, "d 'de' MMMM", { locale: ptBR });
            const weekDay = format(date, 'EEEE', { locale: ptBR });

            return (
              <div
                key={record.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center min-w-[40px]">
                  <span className="text-2xl" title={FLOW_LABELS[record.flow_level]}>
                    {FLOW_ICONS[record.flow_level]}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold capitalize">{formattedDate}</span>
                    <span className="text-xs text-muted-foreground capitalize">({weekDay})</span>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${FLOW_COLORS[record.flow_level]}20`,
                        color: FLOW_COLORS[record.flow_level],
                      }}
                    >
                      {FLOW_LABELS[record.flow_level]}
                    </span>
                  </div>

                  {record.symptoms.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">
                        Sintomas: {record.symptoms.join(', ')}
                      </p>
                    </div>
                  )}

                  {record.notes && (
                    <div className="mt-1">
                      <p className="text-xs text-muted-foreground italic">
                        {record.notes}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  onClick={() => handleDelete(record.record_date)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
