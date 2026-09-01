import { getStoredUser } from '../../services/auth'

// Painel inicial — vira um dashboard de verdade (contadores/alertas dos
// módulos) na etapa de revisão final, depois que todos os módulos
// existirem pra agregar dados.
export function DashboardPage() {
  const user = getStoredUser()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Olá, {user?.name?.split(' ')[0]} 👋</h1>
      <p className="mt-1 text-slate-500">Bem-vindo(a) ao ERP de Produção.</p>
    </div>
  )
}
