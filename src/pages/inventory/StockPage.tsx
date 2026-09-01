import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { useStockBalances } from '../../hooks/useStock'
import type { StockItem } from '../../types/inventory'
import { StockMovementFormModal } from './StockMovementFormModal'

export function StockPage() {
  const [creating, setCreating] = useState(false)
  const { data: balances, isLoading } = useStockBalances()

  const columns: DataTableColumn<StockItem>[] = [
    { header: 'Produto', cell: (s) => <span className="font-medium text-slate-900">{s.productCode} — {s.productName}</span> },
    { header: 'Almoxarifado', cell: (s) => s.warehouseName },
    { header: 'Saldo', className: 'text-right', cell: (s) => <span className="tabular-nums">{s.quantity}</span> },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Estoque</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={16} />
          Novo movimento
        </button>
      </div>

      <DataTable columns={columns} data={balances} isLoading={isLoading} rowKey={(s) => `${s.productId}:${s.warehouseId}`} emptyMessage="Nenhum saldo de estoque ainda." />

      {creating && <StockMovementFormModal onClose={() => setCreating(false)} />}
    </div>
  )
}
