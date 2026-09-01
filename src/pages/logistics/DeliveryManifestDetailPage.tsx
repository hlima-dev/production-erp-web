import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { StatusBadge } from '../../components/StatusBadge'
import { useCompleteDeliveryManifest, useDeliveryManifest, useStartDeliveryManifest } from '../../hooks/useDeliveryManifests'
import { DELIVERY_MANIFEST_STATUS_LABELS, DELIVERY_MANIFEST_STATUS_TONES } from '../../types/logistics'
import { getErrorMessage } from '../../services/api'

export function DeliveryManifestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: manifest, isLoading } = useDeliveryManifest(id)
  const [error, setError] = useState<string | null>(null)

  const startManifest = useStartDeliveryManifest()
  const completeManifest = useCompleteDeliveryManifest()

  async function runAction(action: () => Promise<unknown>) {
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (isLoading) return <p className="text-slate-500">Carregando...</p>
  if (!manifest) return <p className="text-slate-500">Romaneio não encontrado.</p>

  return (
    <div>
      <Link to="/romaneios" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} />
        Voltar pros romaneios
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Romaneio #{manifest.manifestNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {manifest.vehiclePlate} · {manifest.driverName} · {new Date(manifest.createdAt).toLocaleString('pt-BR')}
          </p>
          {manifest.notes && <p className="mt-1 text-sm text-slate-400">{manifest.notes}</p>}
        </div>
        <StatusBadge label={DELIVERY_MANIFEST_STATUS_LABELS[manifest.status]} tone={DELIVERY_MANIFEST_STATUS_TONES[manifest.status]} />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Pedidos neste romaneio</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {manifest.orders.map((order) => (
              <tr key={order.orderId}>
                <td className="px-4 py-3">
                  <Link to={`/pedidos/${order.orderId}`} className="font-medium text-amber-700 hover:underline">
                    #{order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700">{order.customerName}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">R$ {order.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        {manifest.status === 'PLANEJADO' && (
          <button
            type="button"
            onClick={() => runAction(() => startManifest.mutateAsync(manifest.id))}
            disabled={startManifest.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Iniciar rota
          </button>
        )}
        {manifest.status === 'EM_ROTA' && (
          <button
            type="button"
            onClick={() => runAction(() => completeManifest.mutateAsync(manifest.id))}
            disabled={completeManifest.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Concluir rota (marca pedidos como entregues)
          </button>
        )}
      </div>
    </div>
  )
}
