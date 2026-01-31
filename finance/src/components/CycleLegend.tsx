import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PHASE_INFO, type CyclePhase } from '@/lib/cyclePhases';
import { Info } from 'lucide-react';

export function CycleLegend() {
  const phases: CyclePhase[] = [
    'menstrual',
    'follicular',
    'ovulatory',
    'luteal_early',
    'luteal_late',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5" />
          Entenda as Fases do Ciclo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {phases.map((phaseKey) => {
            const phase = PHASE_INFO[phaseKey];
            return (
              <div key={phaseKey} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 border-2"
                    style={{
                      backgroundColor: phase.bgColor,
                      borderColor: phase.color,
                    }}
                  />
                  <h3 className="font-semibold text-base">
                    {phase.name} <span className="text-muted-foreground font-normal">({phase.durationDays} {phase.durationDays === 1 ? 'dia' : 'dias'})</span>
                  </h3>
                </div>

                <div className="ml-9 space-y-1 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">
                      O que acontece:{' '}
                    </span>
                    <span className="text-foreground">{phase.description}</span>
                  </div>

                  <div>
                    <span className="font-medium text-muted-foreground">Humor: </span>
                    <span className="text-foreground">{phase.mood}</span>
                  </div>

                  <div>
                    <span className="font-medium text-muted-foreground">
                      Necessidades:{' '}
                    </span>
                    <span className="text-foreground">{phase.needs}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
