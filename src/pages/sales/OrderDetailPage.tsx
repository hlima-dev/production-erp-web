import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import {
  useCancelOrder,
  useConfirmOrder,
  useDeliverOrder,
  useOrder,
  useStartOrderSeparation,
} from '../../hooks/useOrders'
import { useCreateInvoice, useInvoices } from '../../hooks/useInvoices'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '../../types/sales'
import { getErrorMessage } from '../../services/api'

// Pedido é o "hub" que amarra os módulos visualmente: além das ações do
// próprio módulo sales, aqui aparece o botão de emitir NF-e (quando
// EM_SEPARACAO) e o link pra nota já emitida (quando FATURADO em diante) —
// e, quando o módulo logistics existir, o link do romaneio que expediu
// este pedido.
export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading } = useOrder(id)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const confirmOrder = useConfirmOrder()
  const startSeparation = useStartOrderSeparation()
  const deliverOrder = useDeliverOrder()
  const cancelOrder = useCancelOrder()
  const createInvoice = useCreateInvoice()
  // Não há endpoint "nota fiscal por pedido" — busca a lista (já em cache
  // na maior parte das navegações) e acha a nota deste pedido em memória.
  const { data: invoices } = useInvoices()
  const invoiceForOrder = invoices?.find((inv) => inv.orderId === order?.id)

  async function handleIssueInvoice() {
    setError(null)
    try {
      const invoice = await createInvoice.mutateAsync(order!.id)
      navigate(`/notas-fiscais/${invoice.id}`)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function runAction(action: () => Promise<unknown>) {
    setError(null)
    try {
      await action()
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
  if (!order) return <p className="text-slate-500">Pedido não encontrado.</p>

  const canCancel = ['RASCUNHO', 'CONFIRMADO', 'EM_SEPARACAO'].includes(order.status)

  return (
    <div>
      <Link to="/pedidos" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} />
        Voltar pra pedidos
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Pedido #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {order.customerName} · {new Date(order.createdAt).toLocaleString('pt-BR')}
          </p>
        </div>
        <StatusBadge label={ORDER_STATUS_LABELS[order.status]} tone={ORDER_STATUS_TONES[order.status]} />
      </div>

      {invoiceForOrder && (
        <p className="mb-6 -mt-3 text-sm text-slate-500">
          NF-e emitida:{' '}
          <Link to={`/notas-fiscais/${invoiceForOrder.id}`} className="text-amber-700 hover:underline">
            #{invoiceForOrder.invoiceNumber}
          </Link>
        </p>
      )}

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3 text-right">Quantidade</th>
              <th className="px-4 py-3 text-right">Preço unit.</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-slate-700">{item.productName}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">{item.quantity}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">R$ {item.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-900">R$ {item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50">
              <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-slate-600">
                Total
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">R$ {order.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        {order.status === 'RASCUNHO' && (
          <button
            type="button"
            onClick={() => navigate(`/pedidos/${order.id}/editar`)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Editar
          </button>
        )}
        {order.status === 'RASCUNHO' && (
          <button
            type="button"
            onClick={() => runAction(() => confirmOrder.mutateAsync(order.id))}
            disabled={confirmOrder.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Confirmar pedido
          </button>
        )}
        {order.status === 'CONFIRMADO' && (
          <button
            type="button"
            onClick={() => runAction(() => startSeparation.mutateAsync(order.id))}
            disabled={startSeparation.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Iniciar separação
          </button>
        )}
        {order.status === 'EM_SEPARACAO' && (
          <button
            type="button"
            onClick={handleIssueInvoice}
            disabled={createInvoice.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {createInvoice.isPending ? 'Emitindo...' : 'Emitir NF-e'}
          </button>
        )}
        {order.status === 'EXPEDIDO' && (
          <button
            type="button"
            onClick={() => runAction(() => deliverOrder.mutateAsync(order.id))}
            disabled={deliverOrder.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Marcar como entregue
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            onClick={() => setCancelling(true)}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Cancelar pedido
          </button>
        )}
      </div>

      {cancelling && (
        <ConfirmDialog
          title="Cancelar pedido"
          message={`Tem certeza que deseja cancelar o pedido #${order.orderNumber}? Essa ação não pode ser desfeita.`}
          confirmLabel="Cancelar pedido"
          danger
          isLoading={cancelOrder.isPending}
          onConfirm={handleCancel}
          onCancel={() => setCancelling(false)}
        />
      )}
    </div>
  )
}
