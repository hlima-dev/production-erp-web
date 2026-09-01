import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelOrder,
  confirmOrder,
  createOrder,
  deliverOrder,
  getOrder,
  listOrders,
  startOrderSeparation,
  updateOrder,
} from '../services/orders'
import type { OrderInput, OrderStatus } from '../types/sales'

export function useOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: ['orders', status],
    queryFn: () => listOrders(status),
    // Sem ORDER BY no backend — mais recente primeiro é o que faz mais
    // sentido pra uma lista de pedidos (orderNumber é sequencial).
    select: (data) => [...data].sort((a, b) => b.orderNumber - a.orderNumber),
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => getOrder(id!),
    enabled: !!id,
  })
}

function useInvalidateOrders() {
  const queryClient = useQueryClient()
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    if (id) queryClient.invalidateQueries({ queryKey: ['orders', 'detail', id] })
  }
}

export function useCreateOrder() {
  const invalidate = useInvalidateOrders()
  return useMutation({
    mutationFn: (input: OrderInput) => createOrder(input),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateOrder(id: string) {
  const invalidate = useInvalidateOrders()
  return useMutation({
    mutationFn: (input: OrderInput) => updateOrder(id, input),
    onSuccess: () => invalidate(id),
  })
}

export function useConfirmOrder() {
  const invalidate = useInvalidateOrders()
  return useMutation({
    mutationFn: (id: string) => confirmOrder(id),
    onSuccess: (_, id) => invalidate(id),
  })
}

export function useStartOrderSeparation() {
  const invalidate = useInvalidateOrders()
  return useMutation({
    mutationFn: (id: string) => startOrderSeparation(id),
    onSuccess: (_, id) => invalidate(id),
  })
}

export function useDeliverOrder() {
  const invalidate = useInvalidateOrders()
  return useMutation({
    mutationFn: (id: string) => deliverOrder(id),
    onSuccess: (_, id) => invalidate(id),
  })
}

export function useCancelOrder() {
  const invalidate = useInvalidateOrders()
  return useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: (_, id) => invalidate(id),
  })
}
