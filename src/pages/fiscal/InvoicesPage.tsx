import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { useInvoices } from '../../hooks/useInvoices'
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_TONES } from '../../types/fiscal'
import type { Invoice, InvoiceStatus } from '../../types/fiscal'

export function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('')
  const { data: invoices, isLoading } = useInvoices(statusFilter || undefined)

  const columns: DataTableColumn<Invoice>[] = [
    {
      header: 'NF-e',
      cell: (i) => (
        <Link to={`/notas-fiscais/${i.id}`} className="font-medium text-amber-700 hover:underline">
          #{i.invoiceNumber}
        </Link>
      ),
    },
    { header: 'Pedido', cell: (i) => `#${i.orderNumber}` },
    { header: 'Cliente', cell: (i) => i.customerName },
    { header: 'Status', cell: (i) => <StatusBadge label={INVOICE_STATUS_LABELS[i.status]} tone={INVOICE_STATUS_TONES[i.status]} /> },
    { header: 'Total', className: 'text-right', cell: (i) => `R$ ${i.totalAmount.toFixed(2)}` },
    { header: 'Emitida em', cell: (i) => new Date(i.issueDate).toLocaleDateString('pt-BR') },
  ]

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Notas fiscais</h1>

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <span>
          NF-e <strong>simulada</strong> — não é transmitida à SEFAZ, sem certificado digital. Chave de acesso e
          impostos são gerados só pra demonstração.
        </span>
      </div>

      <div className="mb-4">
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}>
          <option value="">Todos os status</option>
          {Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={invoices} isLoading={isLoading} rowKey={(i) => i.id} emptyMessage="Nenhuma nota fiscal emitida ainda." />

      <p className="mt-4 text-sm text-slate-500">
        Notas fiscais são emitidas a partir de um pedido em separação — veja o pedido e use "Emitir NF-e".
      </p>
    </div>
  )
}
