import type { AuthResponse, User } from '../types/auth'

// Único lugar que lê/escreve a sessão no localStorage — separado de
// api.ts e auth.ts pra evitar import circular entre os dois (api.ts
// precisa ler/limpar tokens no interceptor; auth.ts precisa chamar a API
// pra fazer login/refresh). Nenhum dos dois depende do outro.
const ACCESS_TOKEN_KEY = '@erp:accessToken'
const REFRESH_TOKEN_KEY = '@erp:refreshToken'
const USER_KEY = '@erp:user'

export function saveSession(auth: AuthResponse): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function hasStoredSession(): boolean {
  return !!getAccessToken()
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}
