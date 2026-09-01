import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelInvoice, createInvoice, getInvoice, listInvoices } from '../services/invoices'
import type { InvoiceStatus } from '../types/fiscal'

export function useInvoices(status?: InvoiceStatus) {
  return useQuery({
    queryKey: ['invoices', status],
    queryFn: () => listInvoices(status),
    select: (data) => [...data].sort((a, b) => b.invoiceNumber - a.invoiceNumber),
  })
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ['invoices', 'detail', id],
    queryFn: () => getInvoice(id!),
    enabled: !!id,
  })
}

function useInvalidateInvoices() {
  const queryClient = useQueryClient()
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
    if (id) queryClient.invalidateQueries({ queryKey: ['invoices', 'detail', id] })
    // Emitir NF-e muda o status do pedido (EM_SEPARACAO -> FATURADO).
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }
}

export function useCreateInvoice() {
  const invalidate = useInvalidateInvoices()
  return useMutation({
    mutationFn: (orderId: string) => createInvoice(orderId),
    onSuccess: () => invalidate(),
  })
}

export function useCancelInvoice() {
  const invalidate = useInvalidateInvoices()
  return useMutation({
    mutationFn: (id: string) => cancelInvoice(id),
    onSuccess: (_, id) => invalidate(id),
  })
}
