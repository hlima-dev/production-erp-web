import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { useWarehouses } from '../../hooks/useWarehouses'
import type { Warehouse } from '../../types/inventory'
import { WarehouseFormModal } from './WarehouseFormModal'

export function WarehousesPage() {
  const [creating, setCreating] = useState(false)
  const { data: warehouses, isLoading } = useWarehouses()

  const columns: DataTableColumn<Warehouse>[] = [
    { header: 'Código', cell: (w) => <span className="font-medium text-slate-900">{w.code}</span> },
    { header: 'Nome', cell: (w) => w.name },
    { header: 'Status', cell: (w) => <StatusBadge label={w.active ? 'Ativo' : 'Inativo'} tone={w.active ? 'green' : 'neutral'} /> },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Almoxarifados</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={16} />
          Novo almoxarifado
        </button>
      </div>

      <DataTable columns={columns} data={warehouses} isLoading={isLoading} rowKey={(w) => w.id} emptyMessage="Nenhum almoxarifado cadastrado." />

      {creating && <WarehouseFormModal onClose={() => setCreating(false)} />}
    </div>
  )
}
