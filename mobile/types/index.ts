// ===============================
// TIPOS COMPARTILHADOS - MOBILE
// ===============================

// ROTINAS
export interface Routine {
  id: string;
  name: string;
  description?: string;
  period: 'morning' | 'afternoon' | 'night';
  frequency: 'daily' | 'weekly' | 'custom';
  specificDays?: number[];
  timesPerWeek?: number;
  icon?: string;
  color?: string;
  isActive: boolean;
  addToHabitTracking?: boolean;
  displayOrder?: number;
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

// HÁBITOS
export interface Habit {
  id: string;
  routineId?: string;
  name: string;
  period?: 'morning' | 'afternoon' | 'night';
  frequency: 'daily' | 'weekly' | 'monthly' | 'once';
  specificDays?: number[];
  timesPerWeek?: number;
  startDate: string;
  endDate?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
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

// HUMOR
export interface DailyMood {
  id: string;
  moodDate: string;
  dayRating?: number;
  emotionIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Emotion {
  id: string;
  name: string;
  emoji: string;
  color: string;
  category: 'positive' | 'neutral' | 'negative';
}

// TAREFAS (TODO LIST)
export interface TodoList {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  isDefault: boolean;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  listId: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

// METAS
export interface Goal {
  id: string;
  title: string;
  description?: string;
  category?: string;
  targetDate?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

// WISHLIST
export interface WishlistItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  url?: string;
  imageUrl?: string;
  purchased: boolean;
  purchasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// LISTA DE MERCADO
export interface ShoppingList {
  id: string;
  name: string;
  date?: string;
  completed: boolean;
  totalEstimated?: number;
  totalActual?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: string;
  listId: string;
  name: string;
  quantity?: number;
  unit?: string;
  estimatedPrice?: number;
  actualPrice?: number;
  category?: string;
  checked: boolean;
  createdAt: string;
  updatedAt: string;
}

// CALENDÁRIO
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  color?: string;
  reminder?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

// FINANCEIRO
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category?: string;
  date: string;
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

// CONSTANTES
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

export const PERIOD_LABELS = {
  morning: { label: 'Manhã', emoji: '☀️', color: '#fbbf24' },
  afternoon: { label: 'Tarde', emoji: '🌤️', color: '#60a5fa' },
  night: { label: 'Noite', emoji: '🌙', color: '#a78bfa' },
};

export const FREQUENCY_LABELS = {
  daily: 'Diariamente',
  weekly: 'Semanalmente',
  monthly: 'Mensalmente',
  once: 'Somente hoje',
  custom: 'Personalizado',
};

export const DAY_RATING_LABELS: { [key: number]: string } = {
  0: 'Péssimo',
  1: 'Muito Ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente',
};

export const WEEKDAYS = [
  { id: 0, label: 'Dom', fullLabel: 'Domingo' },
  { id: 1, label: 'Seg', fullLabel: 'Segunda' },
  { id: 2, label: 'Ter', fullLabel: 'Terça' },
  { id: 3, label: 'Qua', fullLabel: 'Quarta' },
  { id: 4, label: 'Qui', fullLabel: 'Quinta' },
  { id: 5, label: 'Sex', fullLabel: 'Sexta' },
  { id: 6, label: 'Sáb', fullLabel: 'Sábado' },
];
