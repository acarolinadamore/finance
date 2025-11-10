export type HungerLevel = 'very-hungry' | 'little-hungry' | 'not-hungry';
export type SatisfactionLevel = 'satisfied' | 'ate-little' | 'ate-too-much';
export type MealType =
  | 'breakfast'
  | 'morning-snack'
  | 'lunch'
  | 'afternoon-snack'
  | 'dinner'
  | 'evening-snack'
  | 'off-hours';

export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
}

export interface Meal {
  id: string;
  date: string;
  time?: string;
  mealType?: MealType;
  hungerLevel?: HungerLevel;
  satisfactionLevel?: SatisfactionLevel;
  foodItems: FoodItem[];
  photo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealReport {
  totalMeals: number;
  mealsByType: Record<MealType, number>;
  hungerPatterns: Record<HungerLevel, number>;
  satisfactionPatterns: Record<SatisfactionLevel, number>;
  period: {
    start: string;
    end: string;
  };
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  'breakfast': 'Café da Manhã',
  'morning-snack': 'Lanche da Manhã',
  'lunch': 'Almoço',
  'afternoon-snack': 'Lanche da Tarde',
  'dinner': 'Jantar',
  'evening-snack': 'Ceia',
  'off-hours': 'Fora de Hora/Escapadinha',
};

export const HUNGER_LEVEL_LABELS: Record<HungerLevel, { label: string; emoji: string }> = {
  'very-hungry': { label: 'Muita fome', emoji: '😋' },
  'little-hungry': { label: 'Pouca fome', emoji: '🙂' },
  'not-hungry': { label: 'Sem fome', emoji: '😐' },
};

export const SATISFACTION_LEVEL_LABELS: Record<SatisfactionLevel, { label: string; emoji: string }> = {
  'satisfied': { label: 'Satisfeita', emoji: '😌' },
  'ate-little': { label: 'Comeu pouco', emoji: '😕' },
  'ate-too-much': { label: 'Comeu demais', emoji: '🤰' },
};
