export type UserRole = 'ADMIN' | 'OPERADOR'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// Formato de erro devolvido pelo GlobalExceptionHandler do backend
// (shared/exception/ApiError.java).
export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  fieldErrors?: Record<string, string> | null
}
