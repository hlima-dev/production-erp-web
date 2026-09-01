import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Modal } from '../../components/Modal'
import {
  useCancelProductionOrder,
  useCompleteProductionOrder,
  useProductionOrder,
  useStartProductionOrder,
} from '../../hooks/useProductionOrders'
import { useBillOfMaterial } from '../../hooks/useProducts'
import { PRODUCTION_ORDER_STATUS_LABELS, PRODUCTION_ORDER_STATUS_TONES } from '../../types/production'
import { getErrorMessage } from '../../services/api'

export function ProductionOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading } = useProductionOrder(id)
  const { data: bom } = useBillOfMaterial(order?.productId)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [completing, setCompleting] = useState(false)

  const startOrder = useStartProductionOrder()
  const completeOrder = useCompleteProductionOrder()
  const cancelOrder = useCancelProductionOrder()

  async function handleStart() {
    setError(null)
    try {
      await startOrder.mutateAsync(id!)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleCancel() {
    setError(null)
    try {
      await cancelOrder.mutateAsync(id!)
      setCancelling(false)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (isLoading) return <p className="text-slate-500">Carregando...</p>
  if (!order) return <p className="text-slate-500">Ordem de produção não encontrada.</p>

  return (
    <div>
      <Link to="/producao" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} />
        Voltar pras ordens de produção
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">OP #{order.orderNumber} — {order.productName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Almoxarifado {order.warehouseName} · Planejado: {order.plannedQuantity}
            {order.producedQuantity != null && ` · Produzido: ${order.producedQuantity}`}
          </p>
          {order.notes && <p className="mt-1 text-sm text-slate-400">{order.notes}</p>}
        </div>
        <StatusBadge label={PRODUCTION_ORDER_STATUS_LABELS[order.status]} tone={PRODUCTION_ORDER_STATUS_TONES[order.status]} />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {bom && bom.items.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Insumos necessários (ficha técnica × quantidade planejada)</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Insumo</th>
                <th className="px-4 py-3 text-right">Por unidade</th>
                <th className="px-4 py-3 text-right">Total necessário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bom.items.map((item) => (
                <tr key={item.ingredientId}>
                  <td className="px-4 py-3 text-slate-700">{item.ingredientCode} — {item.ingredientName}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">{item.quantityPerUnit}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-900">
                    {Number((item.quantityPerUnit * order.plannedQuantity).toFixed(6))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {order.status === 'ABERTA' && (
          <button
            type="button"
            onClick={handleStart}
            disabled={startOrder.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Iniciar produção
          </button>
        )}
        {order.status === 'EM_PRODUCAO' && (
          <button
            type="button"
            onClick={() => setCompleting(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Concluir produção
          </button>
        )}
        {order.status === 'ABERTA' && (
          <button
            type="button"
            onClick={() => setCancelling(true)}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Cancelar ordem
          </button>
        )}
      </div>

      {cancelling && (
        <ConfirmDialog
          title="Cancelar ordem de produção"
          message={`Tem certeza que deseja cancelar a OP #${order.orderNumber}?`}
          confirmLabel="Cancelar ordem"
          danger
          isLoading={cancelOrder.isPending}
          onConfirm={handleCancel}
          onCancel={() => setCancelling(false)}
        />
      )}

      {completing && (
        <CompleteProductionModal
          plannedQuantity={order.plannedQuantity}
          isLoading={completeOrder.isPending}
          onClose={() => setCompleting(false)}
          onConfirm={async (producedQuantity) => {
            setError(null)
            try {
              await completeOrder.mutateAsync({ id: order.id, producedQuantity })
              setCompleting(false)
            } catch (err) {
              setError(getErrorMessage(err))
              setCompleting(false)
            }
          }}
        />
      )}
    </div>
  )
}

interface CompleteProductionModalProps {
  plannedQuantity: number
  isLoading: boolean
  onClose: () => void
  onConfirm: (producedQuantity?: number) => void
}

function CompleteProductionModal({ plannedQuantity, isLoading, onClose, onConfirm }: CompleteProductionModalProps) {
  const [value, setValue] = useState('')

  return (
    <Modal title="Concluir produção" onClose={onClose}>
      <p className="text-sm text-slate-600">
        Quantidade realmente produzida, se diferente da planejada ({plannedQuantity}) — ex: perda no processo. Deixe em
        branco pra usar a quantidade planejada.
      </p>
      <input
        type="number"
        step="0.000001"
        className="input mt-4"
        placeholder={`${plannedQuantity}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onConfirm(value === '' ? undefined : Number(value))}
          disabled={isLoading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {isLoading ? 'Concluindo...' : 'Concluir produção'}
        </button>
      </div>
    </Modal>
  )
}
