export type InvoiceStatus = 'EMITIDA' | 'CANCELADA'

export interface InvoiceItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  cfop: string
  icmsRate: number
  icmsAmount: number
  pisRate: number
  pisAmount: number
  cofinsRate: number
  cofinsAmount: number
}

export interface Invoice {
  id: string
  invoiceNumber: number
  accessKey: string
  orderId: string
  orderNumber: number
  customerName: string
  status: InvoiceStatus
  totalAmount: number
  totalIcms: number
  totalPis: number
  totalCofins: number
  items: InvoiceItem[]
  issueDate: string
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  EMITIDA: 'Emitida',
  CANCELADA: 'Cancelada',
}

export const INVOICE_STATUS_TONES: Record<InvoiceStatus, 'neutral' | 'blue' | 'green' | 'red' | 'amber'> = {
  EMITIDA: 'green',
  CANCELADA: 'red',
}
