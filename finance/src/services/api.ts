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

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
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
  console.log('🚀 [Frontend] Enviando createRoutine:', routine);
  console.log('🚀 [Frontend] add_to_habit_tracking =', routine.add_to_habit_tracking);
  console.log('🚀 [Frontend] URL:', `${API_BASE_URL}/routines`);

  const response = await fetch(`${API_BASE_URL}/routines`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(routine),
  });

  console.log('📥 [Frontend] Response status:', response.status);
  console.log('📥 [Frontend] Response ok:', response.ok);

  return handleResponse<ApiRoutine>(response);
}

export async function updateRoutine(id: string, routine: Partial<ApiRoutine>): Promise<ApiRoutine> {
  console.log('🔄 [Frontend] Enviando updateRoutine:', { id, routine });
  console.log('🔄 [Frontend] add_to_habit_tracking =', routine.add_to_habit_tracking);

  const response = await fetch(`${API_BASE_URL}/routines/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(routine),
  });

  console.log('📥 [Frontend] Update Response status:', response.status);
  console.log('📥 [Frontend] Update Response ok:', response.ok);

  return handleResponse<ApiRoutine>(response);
}

export async function deleteRoutine(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/routines/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}

export async function reorderRoutines(orders: { id: string; display_order: number }[]): Promise<void> {
  console.log('🔄 [API] Enviando reorderRoutines:', orders);

  const response = await fetch(`${API_BASE_URL}/routines/reorder`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ orders }),
  });

  console.log('📥 [API] Reorder Response status:', response.status);
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
  completed: boolean;
}): Promise<ApiRoutineCompletion> {
  console.log('📡 [API] toggleRoutineCompletion:', data);

  const response = await fetch(`${API_BASE_URL}/routine-completions/toggle`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await handleResponse<ApiRoutineCompletion>(response);
  console.log('📥 [API] toggleRoutineCompletion response:', result);
  return result;
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
  console.log('🔍 [API] Buscando hábitos...');
  const response = await fetch(`${API_BASE_URL}/habits`);
  const data = await handleResponse<ApiHabit[]>(response);
  console.log('✅ [API] Hábitos retornados (raw):', data);
  console.log('✅ [API] Total de hábitos:', data.length);

  // Normalizar is_active para garantir compatibilidade
  const normalizedData = data.map((habit: any) => ({
    ...habit,
    is_active: habit.is_active !== undefined ? habit.is_active : true, // Default true se undefined
  }));

  console.log('✅ [API] Hábitos normalizados:', normalizedData);
  return normalizedData;
}

export async function createHabit(habit: Omit<ApiHabit, 'id'>): Promise<ApiHabit> {
  const response = await fetch(`${API_BASE_URL}/habits`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(habit),
  });
  return handleResponse<ApiHabit>(response);
}

export async function updateHabit(id: string, habit: Partial<ApiHabit>): Promise<ApiHabit> {
  const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
    body: JSON.stringify(mood),
  });
  return handleResponse<ApiMood>(response);
}

export async function updateMood(date: string, mood: Partial<ApiMood>): Promise<ApiMood> {
  const response = await fetch(`${API_BASE_URL}/moods/${date}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
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

export interface ApiCycleSettings {
  id?: string;
  last_period_start_date: string;
  average_cycle_length: number;
  average_period_length: number;
  luteal_phase_length: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiCycleRecord {
  id?: string;
  record_date: string;
  flow_level: 'none' | 'light' | 'moderate' | 'heavy';
  symptoms: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiCycleStats {
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

export async function fetchCycleSettings(): Promise<ApiCycleSettings> {
  const response = await fetch(`${API_BASE_URL}/cycle-settings`);
  return handleResponse<ApiCycleSettings>(response);
}

export async function upsertCycleSettings(settings: Omit<ApiCycleSettings, 'id'>): Promise<ApiCycleSettings> {
  const response = await fetch(`${API_BASE_URL}/cycle-settings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });
  return handleResponse<ApiCycleSettings>(response);
}

export async function fetchCycleRecords(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<ApiCycleRecord[]> {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const response = await fetch(`${API_BASE_URL}/cycle-records?${queryParams}`);
  return handleResponse<ApiCycleRecord[]>(response);
}

export async function fetchCycleRecordByDate(date: string): Promise<ApiCycleRecord> {
  const response = await fetch(`${API_BASE_URL}/cycle-records/${date}`);
  return handleResponse<ApiCycleRecord>(response);
}

export async function upsertCycleRecord(record: Omit<ApiCycleRecord, 'id'>): Promise<ApiCycleRecord> {
  const response = await fetch(`${API_BASE_URL}/cycle-records`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(record),
  });
  return handleResponse<ApiCycleRecord>(response);
}

export async function updateCycleRecord(date: string, record: Partial<ApiCycleRecord>): Promise<ApiCycleRecord> {
  const response = await fetch(`${API_BASE_URL}/cycle-records/${date}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(record),
  });
  return handleResponse<ApiCycleRecord>(response);
}

export async function deleteCycleRecord(date: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cycle-records/${date}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}

export async function fetchCycleStats(): Promise<ApiCycleStats> {
  const response = await fetch(`${API_BASE_URL}/cycle-stats`);
  return handleResponse<ApiCycleStats>(response);
}

// ==================== CALENDAR EVENTS ====================

export interface ApiCalendarEvent {
  id: string;
  event_date: string;
  event_time: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ApiCreateCalendarEvent {
  event_date: string;
  event_time: string;
  description: string;
}

export async function fetchCalendarEvents(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<ApiCalendarEvent[]> {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const url = `${API_BASE_URL}/calendar-events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetch(url);
  return handleResponse<ApiCalendarEvent[]>(response);
}

export async function createCalendarEvent(event: ApiCreateCalendarEvent): Promise<ApiCalendarEvent> {
  const response = await fetch(`${API_BASE_URL}/calendar-events`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(event),
  });
  return handleResponse<ApiCalendarEvent>(response);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendar-events/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}

// ==================== GENERIC API OBJECT ====================

export const api = {
  get: async <T = any>(url: string): Promise<{ data: T }> => {
    const response = await fetch(`http://localhost:3032${url}`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<T>(response);
    return { data };
  },

  post: async <T = any>(url: string, body?: any): Promise<{ data: T }> => {
    const response = await fetch(`http://localhost:3032${url}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await handleResponse<T>(response);
    return { data };
  },

  put: async <T = any>(url: string, body?: any): Promise<{ data: T }> => {
    const response = await fetch(`http://localhost:3032${url}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await handleResponse<T>(response);
    return { data };
  },

  delete: async <T = any>(url: string): Promise<{ data: T }> => {
    const response = await fetch(`http://localhost:3032${url}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<T>(response);
    return { data };
  },
};

// ============================================
// PROVIDENCIAS E GRACAS API
// ============================================

export interface ApiProvidenciaGracaCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface ApiProvidenciaGraca {
  id: number;
  data: string;
  titulo: string;
  descricao?: string;
  providencia?: string;
  graca?: string;
  pedido?: string;
  intercessores?: string;
  tags: ApiProvidenciaGracaCategory[];
  created_at: string;
  updated_at: string;
}

export async function fetchProvidenciaGracaCategories(): Promise<ApiProvidenciaGracaCategory[]> {
  const response = await fetch(`${API_BASE_URL}/catolico/providencia-graca-categories`);
  return handleResponse<ApiProvidenciaGracaCategory[]>(response);
}

export async function fetchProvidenciasGracas(): Promise<ApiProvidenciaGraca[]> {
  const response = await fetch(`${API_BASE_URL}/catolico/providencias-gracas`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiProvidenciaGraca[]>(response);
}

export async function createProvidenciaGraca(
  data: Omit<ApiProvidenciaGraca, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiProvidenciaGraca> {
  const response = await fetch(`${API_BASE_URL}/catolico/providencias-gracas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiProvidenciaGraca>(response);
}

export async function updateProvidenciaGraca(
  id: number,
  data: Partial<Omit<ApiProvidenciaGraca, 'id' | 'created_at' | 'updated_at'>>
): Promise<ApiProvidenciaGraca> {
  const response = await fetch(`${API_BASE_URL}/catolico/providencias-gracas/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiProvidenciaGraca>(response);
}

export async function deleteProvidenciaGraca(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/catolico/providencias-gracas/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleResponse<{ message: string }>(response);
}

// ==================== CRONOGRAMAS ====================

export interface ApiCronogramaEtapa {
  id: number;
  cronograma_id: number;
  nome: string;
  descricao?: string;
  prioridade: 'alta' | 'media' | 'baixa';
  data_inicio: string;
  data_termino: string;
  cor: string;
  observacoes?: string;
  ordem: number;
  created_at: string;
  updated_at: string;
  cronograma_titulo?: string;
  cronograma_status?: string;
}

export interface ApiCronograma {
  id: number;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_termino: string;
  status: 'ativo' | 'futuro' | 'concluido';
  created_at: string;
  updated_at: string;
  total_etapas?: number;
  etapas_concluidas?: number;
  etapas?: ApiCronogramaEtapa[];
}

// Listar todos os cronogramas
export async function fetchCronogramas(): Promise<ApiCronograma[]> {
  const response = await fetch(`${API_BASE_URL}/cronogramas`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiCronograma[]>(response);
}

// Buscar um cronograma específico com suas etapas
export async function fetchCronograma(id: number): Promise<ApiCronograma> {
  const response = await fetch(`${API_BASE_URL}/cronogramas/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiCronograma>(response);
}

// Criar novo cronograma
export async function createCronograma(
  data: Omit<ApiCronograma, 'id' | 'created_at' | 'updated_at' | 'total_etapas' | 'etapas_concluidas' | 'etapas'>
): Promise<ApiCronograma> {
  const response = await fetch(`${API_BASE_URL}/cronogramas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiCronograma>(response);
}

// Atualizar cronograma
export async function updateCronograma(
  id: number,
  data: Partial<Omit<ApiCronograma, 'id' | 'created_at' | 'updated_at' | 'total_etapas' | 'etapas_concluidas' | 'etapas'>>
): Promise<ApiCronograma> {
  const response = await fetch(`${API_BASE_URL}/cronogramas/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiCronograma>(response);
}

// Deletar cronograma
export async function deleteCronograma(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cronogramas/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleResponse<{ message: string }>(response);
}

// ==================== ETAPAS DO CRONOGRAMA ====================

// Buscar todas as etapas (para visualização no calendário)
export async function fetchCronogramaEtapas(params?: {
  data_inicio?: string;
  data_termino?: string;
}): Promise<ApiCronogramaEtapa[]> {
  const queryParams = new URLSearchParams();
  if (params?.data_inicio) queryParams.append('data_inicio', params.data_inicio);
  if (params?.data_termino) queryParams.append('data_termino', params.data_termino);

  const response = await fetch(
    `${API_BASE_URL}/cronograma-etapas${queryParams.toString() ? `?${queryParams}` : ''}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return handleResponse<ApiCronogramaEtapa[]>(response);
}

// Listar etapas de um cronograma
export async function fetchEtapasByCronograma(cronogramaId: number): Promise<ApiCronogramaEtapa[]> {
  const response = await fetch(`${API_BASE_URL}/cronogramas/${cronogramaId}/etapas`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiCronogramaEtapa[]>(response);
}

// Criar etapa
export async function createCronogramaEtapa(
  cronogramaId: number,
  data: Omit<ApiCronogramaEtapa, 'id' | 'cronograma_id' | 'created_at' | 'updated_at' | 'cronograma_titulo' | 'cronograma_status'>
): Promise<ApiCronogramaEtapa> {
  const response = await fetch(`${API_BASE_URL}/cronogramas/${cronogramaId}/etapas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiCronogramaEtapa>(response);
}

// Atualizar etapa
export async function updateCronogramaEtapa(
  id: number,
  data: Partial<Omit<ApiCronogramaEtapa, 'id' | 'cronograma_id' | 'created_at' | 'updated_at' | 'cronograma_titulo' | 'cronograma_status'>>
): Promise<ApiCronogramaEtapa> {
  const response = await fetch(`${API_BASE_URL}/cronograma-etapas/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiCronogramaEtapa>(response);
}

// Deletar etapa
export async function deleteCronogramaEtapa(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cronograma-etapas/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleResponse<{ message: string }>(response);
}

// ==================== REUNIÕES (MEETINGS) ====================

export interface ApiMeetingTag {
  id: number;
  user_id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingAttachment {
  file_name: string;
  file_type: string;
  file_size: number;
  file_data: string; // base64
}

export interface MeetingLink {
  url: string;
}

export interface ApiMeeting {
  id: number;
  user_id: number;
  tag_id: number;
  meeting_date: string;
  meeting_time?: string;
  title: string;
  summary?: string;
  description?: string;
  participants?: string;
  links?: MeetingLink[];
  my_definitions?: string;
  participant_definitions?: string;
  decisions?: string;
  next_steps?: string;
  pending?: string;
  attachments?: MeetingAttachment[];
  created_at: string;
  updated_at: string;
  tag_name?: string;
  tag_color?: string;
}

// Meeting Tags
export async function fetchMeetingTags() {
  const response = await fetch(`${API_BASE_URL}/meeting-tags`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiMeetingTag[]>(response);
}

export async function createMeetingTag(data: { name: string; color: string }) {
  const response = await fetch(`${API_BASE_URL}/meeting-tags`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiMeetingTag>(response);
}

export async function updateMeetingTag(id: number, data: { name: string; color: string }) {
  const response = await fetch(`${API_BASE_URL}/meeting-tags/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiMeetingTag>(response);
}

export async function deleteMeetingTag(id: number) {
  const response = await fetch(`${API_BASE_URL}/meeting-tags/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleResponse<{ message: string }>(response);
}

// Meetings
export async function fetchMeetings() {
  const response = await fetch(`${API_BASE_URL}/meetings`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiMeeting[]>(response);
}

export async function createMeeting(data: Omit<ApiMeeting, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'tag_name' | 'tag_color'>) {
  const response = await fetch(`${API_BASE_URL}/meetings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiMeeting>(response);
}

export async function updateMeeting(id: number, data: Partial<Omit<ApiMeeting, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'tag_name' | 'tag_color'>>) {
  const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiMeeting>(response);
}

export async function deleteMeeting(id: number) {
  const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleResponse<{ message: string }>(response);
}
