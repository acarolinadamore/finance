export type Period = 'morning' | 'afternoon' | 'night';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'once';
export type RoutineType = 'task' | 'habit' | 'reminder';
export type EmotionCategory = 'positive' | 'neutral' | 'negative';

export interface Emotion {
  id: string;
  name: string;
  emoji: string;
  color: string;
  category: EmotionCategory;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  period: Period;
  frequency: Frequency;
  routineType?: RoutineType; // Mantido para compatibilidade, mas não usado
  specificDays?: number[]; // Dias específicos da semana (0-6)
  timesPerWeek?: number; // X vezes por semana
  icon?: string;
  isActive: boolean;
  addToHabitTracking?: boolean; // Se deve aparecer no controle de hábitos
  createdAt: string;
  updatedAt: string;
}

export interface RoutineCompletion {
  id: string;
  routineId: string;
  completionDate: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo, 6 = sábado

export interface Habit {
  id: string;
  routineId?: string; // Link com rotina se vier de lá
  name: string;
  period?: Period; // manhã/tarde/noite (opcional)
  frequency: Frequency; // diário, semanal, mensal
  specificDays?: WeekDay[]; // Para frequência semanal (ex: [1,3,5] = seg,qua,sex)
  timesPerWeek?: number; // Para "X vezes por semana"
  startDate: string; // Data de início
  endDate?: string; // Data de término (opcional)
  icon?: string;
  color?: string;
  isActive: boolean; // true = ativo, false = arquivado
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completionDate: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface DailyMood {
  id: string;
  moodDate: string;
  dayRating?: number; // 0-5
  emotionIds: string[]; // IDs das emoções selecionadas
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const PERIOD_LABELS: Record<Period, { label: string; emoji: string; color: string }> = {
  morning: { label: 'Manhã', emoji: '☀️', color: '#fbbf24' },
  afternoon: { label: 'Tarde', emoji: '🌤️', color: '#60a5fa' },
  night: { label: 'Noite', emoji: '🌙', color: '#a78bfa' },
};

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: 'Diariamente',
  weekly: 'Semanalmente',
  monthly: 'Mensalmente',
  once: 'Somente hoje',
};

export const ROUTINE_TYPE_LABELS: Record<RoutineType, string> = {
  task: 'Tarefa',
  habit: 'Hábito',
  reminder: 'Lembrete',
};

// Lista de emoções disponíveis
export const EMOTIONS: Emotion[] = [
  { id: '1', name: 'Feliz', emoji: '😊', color: '#10b981', category: 'positive' },
  { id: '2', name: 'Bem', emoji: '🙂', color: '#84cc16', category: 'positive' },
  { id: '3', name: 'Neutra', emoji: '😐', color: '#f59e0b', category: 'neutral' },
  { id: '4', name: 'Cansada', emoji: '😴', color: '#94a3b8', category: 'negative' },
  { id: '5', name: 'Estressada', emoji: '😰', color: '#ef4444', category: 'negative' },
  { id: '6', name: 'Triste', emoji: '😢', color: '#dc2626', category: 'negative' },
  { id: '7', name: 'Ansiosa', emoji: '😟', color: '#f97316', category: 'negative' },
  { id: '8', name: 'Calma', emoji: '😌', color: '#14b8a6', category: 'positive' },
  { id: '9', name: 'Motivada', emoji: '💪', color: '#8b5cf6', category: 'positive' },
  { id: '10', name: 'Esperançosa', emoji: '🤗', color: '#06b6d4', category: 'positive' },
  { id: '11', name: 'Desesperançosa', emoji: '😞', color: '#b91c1c', category: 'negative' },
  { id: '12', name: 'Inspirada', emoji: '✨', color: '#a855f7', category: 'positive' },
  { id: '13', name: 'Paz', emoji: '🕊️', color: '#6ee7b7', category: 'positive' },
  { id: '14', name: 'Irritada', emoji: '😤', color: '#dc2626', category: 'negative' },
];

export const DAY_RATING_LABELS: Record<number, string> = {
  0: 'Péssimo',
  1: 'Muito Ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente',
};
