// API Configuration
export const API_CONFIG = {
  // Durante desenvolvimento local
  DEV_URL: 'http://localhost:3032',

  // Quando publicar (atualizar depois)
  PROD_URL: 'https://sua-api.com',

  // Usar baseado no ambiente
  BASE_URL: process.env.NODE_ENV === 'production'
    ? 'https://sua-api.com'
    : 'http://localhost:3032',
};

// Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',

  // Admin
  ADMIN_USERS: '/api/admin/users',
  ADMIN_STATS: '/api/admin/stats',

  // Routines
  ROUTINES: '/api/routines',
  ROUTINE_COMPLETIONS: '/api/routine-completions',

  // Habits
  HABITS: '/api/habits',
  HABIT_COMPLETIONS: '/api/habit-completions',
};

// Helper para criar headers com auth
export const createAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});
