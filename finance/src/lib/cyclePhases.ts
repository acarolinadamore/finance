import { addDays, differenceInDays, startOfDay } from 'date-fns';

export type CyclePhase =
  | 'menstrual'
  | 'follicular'
  | 'ovulatory'
  | 'luteal_early'
  | 'luteal_late';

export interface PhaseInfo {
  phase: CyclePhase;
  name: string;
  description: string;
  mood: string;
  needs: string;
  color: string;
  bgColor: string;
  textColor: string;
  durationDays: number;
}

export const PHASE_INFO: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    phase: 'menstrual',
    name: 'Fase Menstrual',
    description: 'Eliminação do endométrio (parede do útero). Os níveis hormonais estão baixos.',
    mood: 'Introspecção, sensibilidade, necessidade de recolhimento',
    needs: 'Descanso, acolhimento, hidratação e alimentos ricos em ferro',
    color: 'rgb(244, 114, 182)',
    bgColor: 'rgb(252, 231, 243)',
    textColor: 'rgb(157, 23, 77)',
    durationDays: 5,
  },
  follicular: {
    phase: 'follicular',
    name: 'Fase Folicular',
    description: 'Os folículos ovarianos amadurecem e o estrogênio aumenta. Renovação da energia.',
    mood: 'Otimismo, criatividade, disposição crescente',
    needs: 'Aproveitar a energia para novos projetos, exercícios físicos, socialização',
    color: 'rgb(134, 239, 172)',
    bgColor: 'rgb(240, 253, 244)',
    textColor: 'rgb(21, 128, 61)',
    durationDays: 9,
  },
  ovulatory: {
    phase: 'ovulatory',
    name: 'Fase Ovulatória',
    description: 'Liberação do óvulo. Pico de estrogênio e testosterona. Período fértil.',
    mood: 'Confiança, extroversão, alta energia e libido',
    needs: 'Comunicação, conexão social, atividades físicas intensas',
    color: 'rgb(250, 204, 21)',
    bgColor: 'rgb(254, 252, 232)',
    textColor: 'rgb(113, 63, 18)',
    durationDays: 4,
  },
  luteal_early: {
    phase: 'luteal_early',
    name: 'Fase Lútea Inicial',
    description: 'Produção de progesterona. Corpo se prepara para possível gravidez.',
    mood: 'Estabilidade, foco, produtividade organizada',
    needs: 'Organização, tarefas detalhadas, autocuidado preventivo',
    color: 'rgb(147, 197, 253)',
    bgColor: 'rgb(239, 246, 255)',
    textColor: 'rgb(29, 78, 216)',
    durationDays: 6,
  },
  luteal_late: {
    phase: 'luteal_late',
    name: 'Fase Lútea Final (TPM)',
    description: 'Queda hormonal se não houver gravidez. Sintomas pré-menstruais podem surgir.',
    mood: 'Irritabilidade, cansaço, ansiedade, necessidade de recolhimento',
    needs: 'Compreensão, paciência consigo mesma, alimentos confortáveis, menos compromissos',
    color: 'rgb(196, 181, 253)',
    bgColor: 'rgb(245, 243, 255)',
    textColor: 'rgb(91, 33, 182)',
    durationDays: 4,
  },
};

export interface CycleSettings {
  last_period_start_date: string; // ISO date string
  average_cycle_length: number;
  average_period_length: number;
}

/**
 * Calcula a fase do ciclo para uma data específica
 */
export function calculatePhaseForDate(
  date: Date,
  settings: CycleSettings
): PhaseInfo | null {
  if (!settings.last_period_start_date) return null;

  const targetDate = startOfDay(date);
  const lastPeriodStart = startOfDay(new Date(settings.last_period_start_date));

  // Calcular quantos dias se passaram desde o início do último período
  let daysSinceLastPeriod = differenceInDays(targetDate, lastPeriodStart);

  // Se a data for anterior ao último período, retornar null
  if (daysSinceLastPeriod < 0) return null;

  // Normalizar para o dia do ciclo atual (1 a cycle_length)
  const cycleDay = (daysSinceLastPeriod % settings.average_cycle_length) + 1;

  // Determinar a fase baseada no dia do ciclo
  const periodLength = settings.average_period_length;
  const cycleLength = settings.average_cycle_length;

  // Fase Menstrual: dias 1 ao período de fluxo
  if (cycleDay >= 1 && cycleDay <= periodLength) {
    return PHASE_INFO.menstrual;
  }

  // Fase Folicular: após menstruação até antes da ovulação
  // Ovulação geralmente ocorre ~14 dias antes do próximo ciclo
  const ovulationStart = cycleLength - 14;
  const follicularEnd = ovulationStart - 1;

  if (cycleDay > periodLength && cycleDay <= follicularEnd) {
    return PHASE_INFO.follicular;
  }

  // Fase Ovulatória: ~4 dias ao redor da ovulação
  const ovulatoryEnd = ovulationStart + 3;

  if (cycleDay >= ovulationStart && cycleDay <= ovulatoryEnd) {
    return PHASE_INFO.ovulatory;
  }

  // Fase Lútea: dividida em inicial e final (TPM)
  // Lútea dura ~14 dias (do fim da ovulação até próxima menstruação)
  const lutealMidpoint = ovulatoryEnd + Math.floor((cycleLength - ovulatoryEnd) / 2);

  if (cycleDay > ovulatoryEnd && cycleDay <= lutealMidpoint) {
    return PHASE_INFO.luteal_early;
  }

  // Fase Lútea Final (TPM): últimos dias antes da menstruação
  if (cycleDay > lutealMidpoint) {
    return PHASE_INFO.luteal_late;
  }

  return null;
}

/**
 * Gera um array de datas com suas respectivas fases para exibição em calendário
 * Suporta múltiplos ciclos no mesmo período (ex: menstruação antecipada)
 */
export function generateCalendarWithPhases(
  startDate: Date,
  endDate: Date,
  settings: CycleSettings,
  periodStartDates?: Date[] // Datas de início de menstruação registradas
): Array<{ date: Date; phase: PhaseInfo | null; cycleDay: number }> {
  const result: Array<{ date: Date; phase: PhaseInfo | null; cycleDay: number }> = [];

  let currentDate = startOfDay(startDate);
  const lastDate = startOfDay(endDate);

  // Ordenar datas de período (mais recente primeiro)
  const sortedPeriodStarts = periodStartDates
    ? [...periodStartDates].sort((a, b) => b.getTime() - a.getTime())
    : [startOfDay(new Date(settings.last_period_start_date))];

  while (currentDate <= lastDate) {
    // Encontrar o início de período mais próximo ANTES OU NO dia atual
    let relevantPeriodStart = sortedPeriodStarts.find(
      (periodDate) => periodDate <= currentDate
    );

    // Se não encontrou nenhum antes, usar o mais antigo
    if (!relevantPeriodStart) {
      relevantPeriodStart = sortedPeriodStarts[sortedPeriodStarts.length - 1];
    }

    // Criar configuração temporária com a data correta
    const tempSettings: CycleSettings = {
      ...settings,
      last_period_start_date: relevantPeriodStart.toISOString().split('T')[0],
    };

    const phase = calculatePhaseForDate(currentDate, tempSettings);

    // Calcular dia do ciclo baseado no início relevante
    const daysSinceLastPeriod = differenceInDays(currentDate, relevantPeriodStart);
    const cycleDay = daysSinceLastPeriod >= 0
      ? (daysSinceLastPeriod % settings.average_cycle_length) + 1
      : 0;

    result.push({
      date: new Date(currentDate),
      phase,
      cycleDay,
    });

    currentDate = addDays(currentDate, 1);
  }

  return result;
}

/**
 * Retorna a fase atual do ciclo
 */
export function getCurrentPhase(settings: CycleSettings): PhaseInfo | null {
  return calculatePhaseForDate(new Date(), settings);
}
