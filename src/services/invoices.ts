import { api } from './api'
import type { Invoice, InvoiceStatus } from '../types/fiscal'

export async function listInvoices(status?: InvoiceStatus): Promise<Invoice[]> {
  const response = await api.get<Invoice[]>('/invoices', { params: status ? { status } : undefined })
  return response.data
}

export async function getInvoice(id: string): Promise<Invoice> {
  const response = await api.get<Invoice>(`/invoices/${id}`)
  return response.data
}

export async function createInvoice(orderId: string): Promise<Invoice> {
  const response = await api.post<Invoice>('/invoices', { orderId })
  return response.data
}

export async function cancelInvoice(id: string): Promise<Invoice> {
  const response = await api.post<Invoice>(`/invoices/${id}/cancel`)
  return response.data
}
