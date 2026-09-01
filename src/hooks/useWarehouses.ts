import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createWarehouse, listWarehouses } from '../services/warehouses'
import type { WarehouseInput } from '../types/inventory'

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: listWarehouses,
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: WarehouseInput) => createWarehouse(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
  })
}
