import axios, { AxiosError } from 'axios'
import type { ApiError, AuthResponse } from '../types/auth'
import { clearSession, getAccessToken, getRefreshToken, saveSession } from './tokenStorage'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

function redirectToLogin() {
  clearSession()
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// Endpoints "pré-sessão": um 401 aqui é resultado normal (senha errada,
// refresh token expirado/inválido) — não deve tentar renovar de novo nem
// redirecionar, só devolver o erro pro chamador tratar.
const AUTH_ENTRY_ENDPOINTS = ['/auth/login', '/auth/refresh']

let refreshInFlight: Promise<boolean> | null = null

// Chamado quando um 401 chega numa rota protegida — tenta renovar a
// sessão com o refresh token de longa duração antes de desistir e mandar
// pro login. Evita derrubar o usuário só porque o access token (15min)
// expirou. `refreshInFlight` deduplica chamadas concorrentes (várias
// requisições batendo 401 ao mesmo tempo).
async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  if (!refreshInFlight) {
    refreshInFlight = axios
      .post<AuthResponse>(`${API_URL}/auth/refresh`, { refreshToken })
      .then((response) => {
        saveSession(response.data)
        return true
      })
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { response } = error
    const config = error.config as (typeof error.config & { _retry?: boolean }) | undefined
    const isAuthEntryCall = !!config?.url && AUTH_ENTRY_ENDPOINTS.some((path) => config.url?.includes(path))

    if (response?.status === 401 && config && !config._retry && !isAuthEntryCall) {
      config._retry = true
      const refreshed = await tryRefresh()
      if (refreshed) return api(config)
      redirectToLogin()
      return Promise.reject(error)
    }

    if (response?.status === 401 && !isAuthEntryCall) {
      redirectToLogin()
    }

    return Promise.reject(error)
  },
)

// Extrai uma mensagem amigável de qualquer erro do axios — cobre tanto o
// formato ApiError do backend quanto falhas de rede/timeout.
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined
    if (apiError?.message) return apiError.message
    if (error.code === 'ECONNABORTED') return 'A requisição demorou demais. Tente novamente.'
    if (!error.response) return 'Não foi possível conectar à API. Verifique se o backend está rodando.'
  }
  return 'Ocorreu um erro inesperado.'
}

// Erros de validação (422 do Bean Validation) vêm com fieldErrors — mapeia
// direto pra field.setError do react-hook-form.
export function getFieldErrors(error: unknown): Record<string, string> | null {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined
    return apiError?.fieldErrors ?? null
  }
  return null
}

export default api
