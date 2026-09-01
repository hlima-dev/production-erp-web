import { api } from './api'
import { clearSession, saveSession } from './tokenStorage'
import type { AuthResponse } from '../types/auth'

export { getStoredUser, hasStoredSession } from './tokenStorage'

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', { email, password })
  saveSession(response.data)
  return response.data
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout')
  } catch {
    // segue o fluxo de limpeza local mesmo se a chamada falhar
    // (ex.: token já expirado)
  } finally {
    clearSession()
  }
}

export interface RegisterUserInput {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'OPERADOR'
}

// Só ADMIN pode chamar (POST /auth/register é @PreAuthorize hasRole('ADMIN') no backend).
export async function registerUser(input: RegisterUserInput): Promise<void> {
  await api.post('/auth/register', input)
}
