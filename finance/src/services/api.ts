const API_BASE_URL = 'http://localhost:3032/api';

export interface ApiTransaction {
  id?: number;
  due_date?: string;
  closing_date?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  card_id?: string;
  amount?: number;
  estimated_amount?: number;
  type?: 'income' | 'expense';
  status?: 'pending' | 'paid' | 'overdue';
  created_at?: string;
}

export interface ApiSummary {
  total_income: string;
  total_expenses: string;
  balance: string;
}

export interface ApiCategory {
  id?: number;
  name: string;
  color: string;
  created_at?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchTransactions(): Promise<ApiTransaction[]> {
  const response = await fetch(`${API_BASE_URL}/transactions`);
  return handleResponse<ApiTransaction[]>(response);
}

export async function createTransaction(transaction: Omit<ApiTransaction, 'id'>): Promise<ApiTransaction> {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });
  return handleResponse<ApiTransaction>(response);
}

export async function updateTransaction(id: number, transaction: Partial<ApiTransaction>): Promise<ApiTransaction> {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });
  return handleResponse<ApiTransaction>(response);
}

export async function deleteTransaction(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}

export async function reorderTransactions(orders: { id: number; display_order: number }[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/transactions/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orders }),
  });
  await handleResponse<{ message: string }>(response);
}

export async function fetchSummary(): Promise<ApiSummary> {
  const response = await fetch(`${API_BASE_URL}/summary`);
  return handleResponse<ApiSummary>(response);
}

export async function checkHealth(): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse<{ status: string; message: string }>(response);
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  return handleResponse<ApiCategory[]>(response);
}

export async function createCategory(category: Omit<ApiCategory, 'id'>): Promise<ApiCategory> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });
  return handleResponse<ApiCategory>(response);
}

export async function updateCategory(id: number, category: Partial<ApiCategory>): Promise<ApiCategory> {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });
  return handleResponse<ApiCategory>(response);
}

export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}

export interface ApiRoutine {
  id?: string;
  name: string;
  period: 'morning' | 'afternoon' | 'night';
  frequency: 'daily' | 'weekly' | 'custom';
  specific_days?: number[];
  times_per_week?: number;
  icon?: string;
  color?: string;
  add_to_habit_tracking?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiRoutineCompletion {
  id?: string;
  routine_id: string;
  completion_date: string;
  completed: boolean;
  created_at?: string;
}

export async function fetchRoutines(): Promise<ApiRoutine[]> {
  const response = await fetch(`${API_BASE_URL}/routines`);
  return handleResponse<ApiRoutine[]>(response);
}

export async function createRoutine(routine: Omit<ApiRoutine, 'id'>): Promise<ApiRoutine> {
  const response = await fetch(`${API_BASE_URL}/routines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routine),
  });
  return handleResponse<ApiRoutine>(response);
}

export async function updateRoutine(id: string, routine: Partial<ApiRoutine>): Promise<ApiRoutine> {
  const response = await fetch(`${API_BASE_URL}/routines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routine),
  });
  return handleResponse<ApiRoutine>(response);
}

export async function deleteRoutine(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/routines/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}

export async function fetchRoutineCompletions(params?: {
  routine_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<ApiRoutineCompletion[]> {
  const queryParams = new URLSearchParams();
  if (params?.routine_id) queryParams.append('routine_id', params.routine_id);
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const response = await fetch(`${API_BASE_URL}/routine-completions?${queryParams}`);
  return handleResponse<ApiRoutineCompletion[]>(response);
}

export async function toggleRoutineCompletion(data: {
  routine_id: string;
  completion_date: string;
}): Promise<ApiRoutineCompletion> {
  const response = await fetch(`${API_BASE_URL}/routine-completions/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApiRoutineCompletion>(response);
}

export interface ApiHabit {
  id?: string;
  routine_id?: string;
  name: string;
  period?: 'morning' | 'afternoon' | 'night';
  frequency: 'daily' | 'weekly' | 'custom';
  specific_days?: number[];
  times_per_week?: number;
  start_date: string;
  end_date?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiHabitCompletion {
  id?: string;
  habit_id: string;
  completion_date: string;
  completed: boolean;
  created_at?: string;
}

export async function fetchHabits(): Promise<ApiHabit[]> {
  const response = await fetch(`${API_BASE_URL}/habits`);
  return handleResponse<ApiHabit[]>(response);
}

export async function createHabit(habit: Omit<ApiHabit, 'id'>): Promise<ApiHabit> {
  const response = await fetch(`${API_BASE_URL}/habits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(habit),
  });
  return handleResponse<ApiHabit>(response);
}

export async function updateHabit(id: string, habit: Partial<ApiHabit>): Promise<ApiHabit> {
  const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(habit),
  });
  return handleResponse<ApiHabit>(response);
}

export async function archiveHabit(id: string): Promise<ApiHabit> {
  const response = await fetch(`${API_BASE_URL}/habits/${id}/archive`, {
    method: 'PATCH',
  });
  return handleResponse<ApiHabit>(response);
}

export async function unarchiveHabit(id: string): Promise<ApiHabit> {
  const response = await fetch(`${API_BASE_URL}/habits/${id}/unarchive`, {
    method: 'PATCH',
  });
  return handleResponse<ApiHabit>(response);
}

export async function deleteHabit(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}

export async function fetchHabitCompletions(params?: {
  habit_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<ApiHabitCompletion[]> {
  const queryParams = new URLSearchParams();
  if (params?.habit_id) queryParams.append('habit_id', params.habit_id);
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const response = await fetch(`${API_BASE_URL}/habit-completions?${queryParams}`);
  return handleResponse<ApiHabitCompletion[]>(response);
}

export async function toggleHabitCompletion(data: {
  habit_id: string;
  completion_date: string;
}): Promise<ApiHabitCompletion> {
  const response = await fetch(`${API_BASE_URL}/habit-completions/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApiHabitCompletion>(response);
}

export interface ApiMood {
  id?: string;
  mood_date: string;
  emotion_ids?: string[];
  day_rating?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchMoods(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<ApiMood[]> {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const response = await fetch(`${API_BASE_URL}/moods?${queryParams}`);
  return handleResponse<ApiMood[]>(response);
}

export async function fetchMoodByDate(date: string): Promise<ApiMood> {
  const response = await fetch(`${API_BASE_URL}/moods/${date}`);
  return handleResponse<ApiMood>(response);
}

export async function upsertMood(mood: Omit<ApiMood, 'id'>): Promise<ApiMood> {
  const response = await fetch(`${API_BASE_URL}/moods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mood),
  });
  return handleResponse<ApiMood>(response);
}

export async function updateMood(date: string, mood: Partial<ApiMood>): Promise<ApiMood> {
  const response = await fetch(`${API_BASE_URL}/moods/${date}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mood),
  });
  return handleResponse<ApiMood>(response);
}

export async function deleteMood(date: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/moods/${date}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}
