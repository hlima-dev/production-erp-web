import { Link } from 'react-router-dom'
import { ClipboardList, FileText, Package, Truck } from 'lucide-react'
import { getStoredUser } from '../../services/auth'
import { useOrders } from '../../hooks/useOrders'
import { useProductionOrders } from '../../hooks/useProductionOrders'
import { useInvoices } from '../../hooks/useInvoices'
import { useDeliveryManifests } from '../../hooks/useDeliveryManifests'
import { StatusBadge } from '../../components/StatusBadge'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '../../types/sales'
import { PRODUCTION_ORDER_STATUS_LABELS, PRODUCTION_ORDER_STATUS_TONES } from '../../types/production'

// Painel inicial: agrega um retrato rápido dos 5 módulos de negócio —
// quanto tem em cada etapa do ciclo do pedido (RASCUNHO → ... → ENTREGUE)
// e o que precisa de atenção agora (pedidos faturados aguardando
// expedição, OPs em produção, romaneios em rota).
export function DashboardPage() {
  const user = getStoredUser()

  const { data: orders } = useOrders()
  const { data: productionOrders } = useProductionOrders()
  const { data: invoices } = useInvoices()
  const { data: manifests } = useDeliveryManifests()

  const openOrders = orders?.filter((o) => ['RASCUNHO', 'CONFIRMADO', 'EM_SEPARACAO'].includes(o.status)).length ?? 0
  const readyToShip = orders?.filter((o) => o.status === 'FATURADO').length ?? 0
  const inProduction = productionOrders?.filter((o) => o.status === 'EM_PRODUCAO').length ?? 0
  const inRoute = manifests?.filter((m) => m.status === 'EM_ROTA').length ?? 0
  const invoicesIssued = invoices?.filter((i) => i.status === 'EMITIDA').length ?? 0

  const recentOrders = orders?.slice(0, 5) ?? []
  const openProductionOrders = productionOrders?.filter((o) => o.status !== 'CONCLUIDA' && o.status !== 'CANCELADA').slice(0, 5) ?? []

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Olá, {user?.name?.split(' ')[0]} 👋</h1>
      <p className="mt-1 text-slate-500">Visão geral do ERP de Produção.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={ClipboardList} label="Pedidos em aberto" value={openOrders} to="/pedidos" />
        <StatCard icon={FileText} label="Faturados p/ expedir" value={readyToShip} to="/pedidos?status=FATURADO" />
        <StatCard icon={Package} label="OPs em produção" value={inProduction} to="/producao" />
        <StatCard icon={Truck} label="Romaneios em rota" value={inRoute} to="/romaneios" />
      </div>

      <p className="mt-2 text-xs text-slate-400">{invoicesIssued} nota(s) fiscal(is) emitida(s) no total.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Pedidos recentes</h2>
            <Link to="/pedidos" className="text-xs font-medium text-amber-700 hover:underline">
              Ver todos
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">Nenhum pedido ainda.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <Link to={`/pedidos/${order.id}`} className="font-medium text-amber-700 hover:underline">
                    #{order.orderNumber}
                  </Link>
                  <span className="text-slate-600">{order.customerName}</span>
                  <StatusBadge label={ORDER_STATUS_LABELS[order.status]} tone={ORDER_STATUS_TONES[order.status]} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Ordens de produção abertas</h2>
            <Link to="/producao" className="text-xs font-medium text-amber-700 hover:underline">
              Ver todas
            </Link>
          </div>
          {openProductionOrders.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">Nenhuma ordem de produção em aberto.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {openProductionOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <Link to={`/producao/${order.id}`} className="font-medium text-amber-700 hover:underline">
                    #{order.orderNumber}
                  </Link>
                  <span className="text-slate-600">{order.productName}</span>
                  <StatusBadge label={PRODUCTION_ORDER_STATUS_LABELS[order.status]} tone={PRODUCTION_ORDER_STATUS_TONES[order.status]} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, to }: { icon: typeof ClipboardList; label: string; value: number; to: string }) {
  return (
    <Link to={to} className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <Icon size={18} className="text-amber-600" />
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </Link>
  )
}
