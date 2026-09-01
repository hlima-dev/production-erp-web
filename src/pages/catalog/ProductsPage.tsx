import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useDeactivateProduct, useProducts } from '../../hooks/useProducts'
import { PRODUCT_TYPE_LABELS } from '../../types/catalog'
import type { Product, ProductType } from '../../types/catalog'
import { ProductFormModal } from './ProductFormModal'
import { getErrorMessage } from '../../services/api'

export function ProductsPage() {
  const [typeFilter, setTypeFilter] = useState<ProductType | ''>('')
  const [includeInactive, setIncludeInactive] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [deactivating, setDeactivating] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: products, isLoading } = useProducts({
    type: typeFilter || undefined,
    includeInactive,
  })
  const deactivateProduct = useDeactivateProduct()

  async function confirmDeactivate() {
    if (!deactivating) return
    setError(null)
    try {
      await deactivateProduct.mutateAsync(deactivating.id)
      setDeactivating(null)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const columns: DataTableColumn<Product>[] = [
    { header: 'Código', cell: (p) => <span className="font-medium text-slate-900">{p.code}</span> },
    {
      header: 'Nome',
      cell: (p) => (
        <Link to={`/produtos/${p.id}`} className="text-amber-700 hover:underline">
          {p.name}
        </Link>
      ),
    },
    { header: 'Tipo', cell: (p) => PRODUCT_TYPE_LABELS[p.type] },
    { header: 'Unidade', cell: (p) => p.unit },
    { header: 'Categoria', cell: (p) => p.category || '—' },
    { header: 'Preço', cell: (p) => (p.price != null ? `R$ ${p.price.toFixed(2)}` : '—') },
    { header: 'Status', cell: (p) => <StatusBadge label={p.active ? 'Ativo' : 'Inativo'} tone={p.active ? 'green' : 'neutral'} /> },
    {
      header: '',
      className: 'text-right',
      cell: (p) => (
        <div className="flex justify-end gap-3 text-sm">
          <button type="button" className="text-slate-500 hover:text-slate-900" onClick={() => setEditingProduct(p)}>
            Editar
          </button>
          {p.active && (
            <button type="button" className="text-red-600 hover:text-red-800" onClick={() => setDeactivating(p)}>
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
        <h1 className="text-2xl font-semibold text-slate-900">Produtos</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={16} />
          Novo produto
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <select
          className="input w-auto"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ProductType | '')}
        >
          <option value="">Todos os tipos</option>
          {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          Incluir inativos
        </label>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <DataTable columns={columns} data={products} isLoading={isLoading} rowKey={(p) => p.id} emptyMessage="Nenhum produto cadastrado." />

      {creating && <ProductFormModal onClose={() => setCreating(false)} />}
      {editingProduct && <ProductFormModal product={editingProduct} onClose={() => setEditingProduct(null)} />}
      {deactivating && (
        <ConfirmDialog
          title="Desativar produto"
          message={`Tem certeza que deseja desativar "${deactivating.name}"? Ele deixa de aparecer nas listagens, mas o histórico é preservado.`}
          confirmLabel="Desativar"
          danger
          isLoading={deactivateProduct.isPending}
          onConfirm={confirmDeactivate}
          onCancel={() => setDeactivating(null)}
        />
      )}
    </div>
  )
}
