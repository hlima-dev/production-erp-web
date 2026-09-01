import { Link, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { useOrders } from '../../hooks/useOrders'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '../../types/sales'
import type { Order, OrderStatus } from '../../types/sales'

export function OrdersPage() {
  // Filtro sincronizado com a URL (?status=...) — permite link direto
  // (ex: painel → "Faturados p/ expedir") já chegando filtrado.
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = (searchParams.get('status') as OrderStatus | null) ?? ''
  const { data: orders, isLoading } = useOrders(statusFilter || undefined)

  function handleStatusChange(value: OrderStatus | '') {
    setSearchParams(value ? { status: value } : {})
  }

  const columns: DataTableColumn<Order>[] = [
    {
      header: 'Pedido',
      cell: (o) => (
        <Link to={`/pedidos/${o.id}`} className="font-medium text-amber-700 hover:underline">
          #{o.orderNumber}
        </Link>
      ),
    },
    { header: 'Cliente', cell: (o) => o.customerName },
    { header: 'Status', cell: (o) => <StatusBadge label={ORDER_STATUS_LABELS[o.status]} tone={ORDER_STATUS_TONES[o.status]} /> },
    { header: 'Itens', className: 'text-right', cell: (o) => o.items.length },
    { header: 'Total', className: 'text-right', cell: (o) => `R$ ${o.totalAmount.toFixed(2)}` },
    { header: 'Criado em', cell: (o) => new Date(o.createdAt).toLocaleDateString('pt-BR') },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Pedidos</h1>
        <Link
          to="/pedidos/novo"
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={16} />
          Novo pedido
        </Link>
      </div>

      <div className="mb-4">
        <select className="input w-auto" value={statusFilter} onChange={(e) => handleStatusChange(e.target.value as OrderStatus | '')}>
          <option value="">Todos os status</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={orders} isLoading={isLoading} rowKey={(o) => o.id} emptyMessage="Nenhum pedido cadastrado." />
    </div>
  )
}
