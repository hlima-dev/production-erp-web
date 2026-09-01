import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getStoredUser } from '../services/auth'

interface AdminRouteProps {
  children: ReactNode
}

// Protege telas de cadastro administrativo (produtos, almoxarifados,
// veículos/motoristas, registrar usuário) — só o papel ADMIN no backend
// tem @PreAuthorize pra essas escritas.
export function AdminRoute({ children }: AdminRouteProps) {
  const user = getStoredUser()

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}
