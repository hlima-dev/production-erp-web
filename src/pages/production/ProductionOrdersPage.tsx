import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { useProductionOrders } from '../../hooks/useProductionOrders'
import { PRODUCTION_ORDER_STATUS_LABELS, PRODUCTION_ORDER_STATUS_TONES } from '../../types/production'
import type { ProductionOrder, ProductionOrderStatus } from '../../types/production'

export function ProductionOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<ProductionOrderStatus | ''>('')
  const { data: orders, isLoading } = useProductionOrders(statusFilter || undefined)

  const columns: DataTableColumn<ProductionOrder>[] = [
    {
      header: 'OP',
      cell: (o) => (
        <Link to={`/producao/${o.id}`} className="font-medium text-amber-700 hover:underline">
          #{o.orderNumber}
        </Link>
      ),
    },
    { header: 'Produto', cell: (o) => o.productName },
    { header: 'Almoxarifado', cell: (o) => o.warehouseName },
    { header: 'Status', cell: (o) => <StatusBadge label={PRODUCTION_ORDER_STATUS_LABELS[o.status]} tone={PRODUCTION_ORDER_STATUS_TONES[o.status]} /> },
    { header: 'Planejado', className: 'text-right', cell: (o) => o.plannedQuantity },
    { header: 'Produzido', className: 'text-right', cell: (o) => o.producedQuantity ?? '—' },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Ordens de produção</h1>
        <Link
          to="/producao/nova"
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={16} />
          Nova ordem
        </Link>
      </div>

      <div className="mb-4">
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ProductionOrderStatus | '')}>
          <option value="">Todos os status</option>
          {Object.entries(PRODUCTION_ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={orders} isLoading={isLoading} rowKey={(o) => o.id} emptyMessage="Nenhuma ordem de produção cadastrada." />
    </div>
  )
}
