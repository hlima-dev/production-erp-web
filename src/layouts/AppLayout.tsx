import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Boxes, LayoutDashboard, LogOut, Menu, Package, ShoppingCart, Users, Warehouse, X } from 'lucide-react'
import { getStoredUser, logout as logoutRequest } from '../services/auth'

// Navegação lateral, agrupada como num ERP de verdade: Cadastros (dados
// mestres, majoritariamente ADMIN) e Operação (uso do dia a dia). Cada
// módulo do backend adiciona seus itens aqui conforme as telas ficam
// prontas — ver plano em /root/.claude/plans/lovely-doodling-mochi.md.
interface NavItem {
  label: string
  path: string
  icon: typeof LayoutDashboard
}

interface NavSection {
  title: string | null
  items: NavItem[]
}

const navSections: NavSection[] = [
  { title: null, items: [{ label: 'Painel', path: '/', icon: LayoutDashboard }] },
  {
    title: 'Cadastros',
    items: [
      { label: 'Produtos', path: '/produtos', icon: Package },
      { label: 'Almoxarifados', path: '/almoxarifados', icon: Warehouse },
      { label: 'Clientes', path: '/clientes', icon: Users },
    ],
  },
  {
    title: 'Operação',
    items: [
      { label: 'Estoque', path: '/estoque', icon: Boxes },
      { label: 'Pedidos', path: '/pedidos', icon: ShoppingCart },
    ],
  },
]

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador(a)',
  OPERADOR: 'Operador(a)',
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const user = getStoredUser()

  async function handleLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-slate-100 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            ERP Produção
          </Link>
          <button
            type="button"
            className="text-slate-400 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-6 px-3 py-4">
          {navSections.map((section, index) => (
            <div key={section.title ?? index}>
              {section.title && (
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {section.title}
                </p>
              )}
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <button
            type="button"
            className="text-slate-500 hover:text-slate-900 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="ml-auto flex items-center gap-4">
            {user && (
              <div className="text-right leading-tight">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{roleLabels[user.role] ?? user.role}</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
