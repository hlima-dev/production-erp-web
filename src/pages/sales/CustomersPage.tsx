import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useCustomers, useDeactivateCustomer } from '../../hooks/useCustomers'
import type { Customer } from '../../types/sales'
import { CustomerFormModal } from './CustomerFormModal'
import { getErrorMessage } from '../../services/api'

export function CustomersPage() {
  const [includeInactive, setIncludeInactive] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [creating, setCreating] = useState(false)
  const [deactivating, setDeactivating] = useState<Customer | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: customers, isLoading } = useCustomers(includeInactive)
  const deactivateCustomer = useDeactivateCustomer()

  async function confirmDeactivate() {
    if (!deactivating) return
    setError(null)
    try {
      await deactivateCustomer.mutateAsync(deactivating.id)
      setDeactivating(null)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const columns: DataTableColumn<Customer>[] = [
    { header: 'Documento', cell: (c) => c.document },
    { header: 'Nome', cell: (c) => <span className="font-medium text-slate-900">{c.name}</span> },
    { header: 'E-mail', cell: (c) => c.email || '—' },
    { header: 'Telefone', cell: (c) => c.phone || '—' },
    { header: 'Status', cell: (c) => <StatusBadge label={c.active ? 'Ativo' : 'Inativo'} tone={c.active ? 'green' : 'neutral'} /> },
    {
      header: '',
      className: 'text-right',
      cell: (c) => (
        <div className="flex justify-end gap-3 text-sm">
          <button type="button" className="text-slate-500 hover:text-slate-900" onClick={() => setEditingCustomer(c)}>
            Editar
          </button>
          {c.active && (
            <button type="button" className="text-red-600 hover:text-red-800" onClick={() => setDeactivating(c)}>
              Desativar
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={16} />
          Novo cliente
        </button>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
          Incluir inativos
        </label>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <DataTable columns={columns} data={customers} isLoading={isLoading} rowKey={(c) => c.id} emptyMessage="Nenhum cliente cadastrado." />

      {creating && <CustomerFormModal onClose={() => setCreating(false)} />}
      {editingCustomer && <CustomerFormModal customer={editingCustomer} onClose={() => setEditingCustomer(null)} />}
      {deactivating && (
        <ConfirmDialog
          title="Desativar cliente"
          message={`Tem certeza que deseja desativar "${deactivating.name}"?`}
          confirmLabel="Desativar"
          danger
          isLoading={deactivateCustomer.isPending}
          onConfirm={confirmDeactivate}
          onCancel={() => setDeactivating(null)}
        />
      )}
    </div>
  )
}
