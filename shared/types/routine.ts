export interface Routine {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  routine_type: 'morning' | 'afternoon' | 'evening' | 'night';
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  specific_days?: number[]; // [0=Dom, 1=Seg, ..., 6=Sáb]
  time?: string;
  display_order?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface RoutineCompletion {
  id: number;
  routine_id: number;
  user_id: number;
  completed_at: string;
  date: string;
}
