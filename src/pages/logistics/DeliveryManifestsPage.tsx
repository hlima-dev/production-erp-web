import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { useDeliveryManifests } from '../../hooks/useDeliveryManifests'
import { DELIVERY_MANIFEST_STATUS_LABELS, DELIVERY_MANIFEST_STATUS_TONES } from '../../types/logistics'
import type { DeliveryManifest, DeliveryManifestStatus } from '../../types/logistics'

export function DeliveryManifestsPage() {
  const [statusFilter, setStatusFilter] = useState<DeliveryManifestStatus | ''>('')
  const { data: manifests, isLoading } = useDeliveryManifests(statusFilter || undefined)

  const columns: DataTableColumn<DeliveryManifest>[] = [
    {
      header: 'Romaneio',
      cell: (m) => (
        <Link to={`/romaneios/${m.id}`} className="font-medium text-amber-700 hover:underline">
          #{m.manifestNumber}
        </Link>
      ),
    },
    { header: 'Veículo', cell: (m) => m.vehiclePlate },
    { header: 'Motorista', cell: (m) => m.driverName },
    { header: 'Status', cell: (m) => <StatusBadge label={DELIVERY_MANIFEST_STATUS_LABELS[m.status]} tone={DELIVERY_MANIFEST_STATUS_TONES[m.status]} /> },
    { header: 'Pedidos', className: 'text-right', cell: (m) => m.orders.length },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Romaneios de expedição</h1>
        <Link
          to="/romaneios/novo"
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={16} />
          Novo romaneio
        </Link>
      </div>

      <div className="mb-4">
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as DeliveryManifestStatus | '')}>
          <option value="">Todos os status</option>
          {Object.entries(DELIVERY_MANIFEST_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={manifests} isLoading={isLoading} rowKey={(m) => m.id} emptyMessage="Nenhum romaneio cadastrado." />
    </div>
  )
}
