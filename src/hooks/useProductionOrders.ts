import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelProductionOrder,
  completeProductionOrder,
  createProductionOrder,
  getProductionOrder,
  listProductionOrders,
  startProductionOrder,
} from '../services/productionOrders'
import type { ProductionOrderInput, ProductionOrderStatus } from '../types/production'

export function useProductionOrders(status?: ProductionOrderStatus) {
  return useQuery({
    queryKey: ['production-orders', status],
    queryFn: () => listProductionOrders(status),
    select: (data) => [...data].sort((a, b) => b.orderNumber - a.orderNumber),
  })
}

export function useProductionOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['production-orders', 'detail', id],
    queryFn: () => getProductionOrder(id!),
    enabled: !!id,
  })
}

function useInvalidateProductionOrders() {
  const queryClient = useQueryClient()
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['production-orders'] })
    if (id) queryClient.invalidateQueries({ queryKey: ['production-orders', 'detail', id] })
    // Iniciar/concluir uma OP mexe no estoque.
    queryClient.invalidateQueries({ queryKey: ['stock'] })
  }
}

export function useCreateProductionOrder() {
  const invalidate = useInvalidateProductionOrders()
  return useMutation({
    mutationFn: (input: ProductionOrderInput) => createProductionOrder(input),
    onSuccess: () => invalidate(),
  })
}

export function useStartProductionOrder() {
  const invalidate = useInvalidateProductionOrders()
  return useMutation({
    mutationFn: (id: string) => startProductionOrder(id),
    onSuccess: (_, id) => invalidate(id),
  })
}

export function useCompleteProductionOrder() {
  const invalidate = useInvalidateProductionOrders()
  return useMutation({
    mutationFn: ({ id, producedQuantity }: { id: string; producedQuantity?: number }) =>
      completeProductionOrder(id, producedQuantity),
    onSuccess: (_, { id }) => invalidate(id),
  })
}

export function useCancelProductionOrder() {
  const invalidate = useInvalidateProductionOrders()
  return useMutation({
    mutationFn: (id: string) => cancelProductionOrder(id),
    onSuccess: (_, id) => invalidate(id),
  })
}
