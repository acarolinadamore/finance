export type FlowLevel = 'none' | 'light' | 'moderate' | 'heavy';

export interface CycleSettings {
  id?: string;
  last_period_start_date: string;
  average_cycle_length: number;
  average_period_length: number;
  luteal_phase_length: number;
  created_at?: string;
  updated_at?: string;
}

export interface CycleRecord {
  id?: string;
  record_date: string;
  flow_level: FlowLevel;
  symptoms: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CycleStats {
  currentCycleDay: number;
  daysUntilNextPeriod: number;
  ovulationDay: number;
  fertileWindowStart: number;
  fertileWindowEnd: number;
  pmsStart: number;
  topSymptoms: string[];
  isRegular: boolean;
  variance: number;
  averagePeriodLength: number;
  averageCycleLength: number;
  lastPeriodStartDate: string;
}

export const SYMPTOMS = [
  'cólica',
  'dor de cabeça',
  'enxaqueca',
  'acne',
  'inchaço',
  'dor lombar',
  'sensibilidade nos seios',
  'alterações intestinais',
  'constipação',
  'diarreia',
  'desejo por doce',
  'desejo por salgado',
  'irritabilidade',
  'tristeza',
  'ansiedade',
  'energia baixa',
  'energia alta',
  'insônia',
  'sonolência',
  'náusea',
  'tontura',
  'cansaço extremo',
  'libido aumentada',
  'libido diminuída',
] as const;

export const FLOW_LABELS: Record<FlowLevel, string> = {
  none: 'Nenhum',
  light: 'Leve',
  moderate: 'Moderado',
  heavy: 'Intenso',
};
