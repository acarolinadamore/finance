// User types for authentication
export interface User {
  id: number
  email: string
  name: string
  role: 'user' | 'admin'
  created_at: string
}

export interface LoginResponse {
  message: string
  user: User
  token: string
}

export interface RegisterResponse {
  message: string
  user: User
  token: string
}
