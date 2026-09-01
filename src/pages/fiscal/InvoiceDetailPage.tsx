import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useCancelInvoice, useInvoice } from '../../hooks/useInvoices'
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_TONES } from '../../types/fiscal'
import { getErrorMessage } from '../../services/api'

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: invoice, isLoading } = useInvoice(id)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const cancelInvoice = useCancelInvoice()

  async function handleCancel() {
    setError(null)
    try {
      await cancelInvoice.mutateAsync(id!)
      setCancelling(false)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (isLoading) return <p className="text-slate-500">Carregando...</p>
  if (!invoice) return <p className="text-slate-500">Nota fiscal não encontrada.</p>

  return (
    <div>
      <Link to="/notas-fiscais" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} />
        Voltar pras notas fiscais
      </Link>

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <span>
          NF-e <strong>simulada</strong> — não transmitida à SEFAZ. Chave de acesso tem só o formato de 44 dígitos,
          não é uma chave real. Impostos calculados com alíquotas fixas simplificadas.
        </span>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">NF-e #{invoice.invoiceNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pedido{' '}
            <Link to={`/pedidos/${invoice.orderId}`} className="text-amber-700 hover:underline">
              #{invoice.orderNumber}
            </Link>{' '}
            · {invoice.customerName} · {new Date(invoice.issueDate).toLocaleString('pt-BR')}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-400">Chave de acesso: {invoice.accessKey}</p>
        </div>
        <StatusBadge label={INVOICE_STATUS_LABELS[invoice.status]} tone={INVOICE_STATUS_TONES[invoice.status]} />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3 text-right">Qtd.</th>
              <th className="px-4 py-3 text-right">Preço unit.</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
              <th className="px-4 py-3">CFOP</th>
              <th className="px-4 py-3 text-right">ICMS</th>
              <th className="px-4 py-3 text-right">PIS</th>
              <th className="px-4 py-3 text-right">COFINS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item) => (
              <tr key={item.productId}>
                <td className="px-4 py-3 text-slate-700">{item.productName}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">{item.quantity}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">R$ {item.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-900">R$ {item.subtotal.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-500">{item.cfop}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                  {item.icmsRate}% · R$ {item.icmsAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                  {item.pisRate}% · R$ {item.pisAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                  {item.cofinsRate}% · R$ {item.cofinsAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <TotalCard label="Total da nota" value={invoice.totalAmount} highlight />
        <TotalCard label="ICMS" value={invoice.totalIcms} />
        <TotalCard label="PIS" value={invoice.totalPis} />
        <TotalCard label="COFINS" value={invoice.totalCofins} />
      </div>

      {invoice.status === 'EMITIDA' && (
        <button
          type="button"
          onClick={() => setCancelling(true)}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Cancelar NF-e
        </button>
      )}

      {cancelling && (
        <ConfirmDialog
          title="Cancelar NF-e"
          message={`Tem certeza que deseja cancelar a NF-e #${invoice.invoiceNumber}? Essa ação não pode ser desfeita (e não reverte o faturamento do pedido).`}
          confirmLabel="Cancelar NF-e"
          danger
          isLoading={cancelInvoice.isPending}
          onConfirm={handleCancel}
          onCancel={() => setCancelling(false)}
        />
      )}
    </div>
  )
}

function TotalCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${highlight ? 'text-slate-300' : 'text-slate-500'}`}>{label}</p>
      <p className="mt-1 text-lg font-semibold">R$ {value.toFixed(2)}</p>
    </div>
  )
}
