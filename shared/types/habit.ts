export interface Habit {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  category?: string;
  goal_frequency?: number;
  goal_period?: 'daily' | 'weekly' | 'monthly';
  icon?: string;
  color?: string;
  display_order?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface HabitCompletion {
  id: number;
  habit_id: number;
  user_id: number;
  completed_at: string;
  date: string;
  notes?: string;
}
