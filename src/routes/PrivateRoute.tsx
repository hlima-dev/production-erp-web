import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { hasStoredSession } from '../services/auth'

interface PrivateRouteProps {
  children: ReactNode
}

// Sinal do lado do cliente de que existe um accessToken salvo — usado só
// pra decidir a rota sem esperar uma chamada à API. Se o token tiver
// expirado mesmo assim, a primeira chamada autenticada volta 401 e o
// interceptor de api.ts tenta renovar via refresh token antes de
// redirecionar pro login de verdade.
export function PrivateRoute({ children }: PrivateRouteProps) {
  const location = useLocation()

  if (!hasStoredSession()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
