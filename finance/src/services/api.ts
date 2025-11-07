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

// Função auxiliar para lidar com erros
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// GET - Buscar todas as transações
export async function fetchTransactions(): Promise<ApiTransaction[]> {
  const response = await fetch(`${API_BASE_URL}/transactions`);
  return handleResponse<ApiTransaction[]>(response);
}

// POST - Criar nova transação
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

// PUT - Atualizar transação existente
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

// DELETE - Deletar transação
export async function deleteTransaction(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}

// PUT - Reordenar transações
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

// GET - Buscar resumo financeiro
export async function fetchSummary(): Promise<ApiSummary> {
  const response = await fetch(`${API_BASE_URL}/summary`);
  return handleResponse<ApiSummary>(response);
}

// GET - Verificar saúde da API
export async function checkHealth(): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse<{ status: string; message: string }>(response);
}

// ============= FUNÇÕES DE CATEGORIAS =============

// GET - Buscar todas as categorias
export async function fetchCategories(): Promise<ApiCategory[]> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  return handleResponse<ApiCategory[]>(response);
}

// POST - Criar nova categoria
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

// PUT - Atualizar categoria existente
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

// DELETE - Deletar categoria
export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}
