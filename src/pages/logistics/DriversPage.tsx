import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useDeactivateDriver, useDrivers } from '../../hooks/useDrivers'
import type { Driver } from '../../types/logistics'
import { DriverFormModal } from './DriverFormModal'
import { getErrorMessage } from '../../services/api'

export function DriversPage() {
  const [includeInactive, setIncludeInactive] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deactivating, setDeactivating] = useState<Driver | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: drivers, isLoading } = useDrivers(includeInactive)
  const deactivateDriver = useDeactivateDriver()

  async function confirmDeactivate() {
    if (!deactivating) return
    setError(null)
    try {
      await deactivateDriver.mutateAsync(deactivating.id)
      setDeactivating(null)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const columns: DataTableColumn<Driver>[] = [
    { header: 'Nome', cell: (d) => <span className="font-medium text-slate-900">{d.name}</span> },
    { header: 'CPF', cell: (d) => d.document },
    { header: 'CNH', cell: (d) => d.license },
    { header: 'Telefone', cell: (d) => d.phone || '—' },
    { header: 'Status', cell: (d) => <StatusBadge label={d.active ? 'Ativo' : 'Inativo'} tone={d.active ? 'green' : 'neutral'} /> },
    {
      header: '',
      className: 'text-right',
      cell: (d) =>
        d.active && (
          <button type="button" className="text-red-600 hover:text-red-800" onClick={() => setDeactivating(d)}>
            Desativar
          </button>
        ),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Motoristas</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={16} />
          Novo motorista
        </button>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
          Incluir inativos
        </label>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <DataTable columns={columns} data={drivers} isLoading={isLoading} rowKey={(d) => d.id} emptyMessage="Nenhum motorista cadastrado." />

      {creating && <DriverFormModal onClose={() => setCreating(false)} />}
      {deactivating && (
        <ConfirmDialog
          title="Desativar motorista"
          message={`Tem certeza que deseja desativar "${deactivating.name}"?`}
          confirmLabel="Desativar"
          danger
          isLoading={deactivateDriver.isPending}
          onConfirm={confirmDeactivate}
          onCancel={() => setDeactivating(null)}
        />
      )}
    </div>
  )
}
