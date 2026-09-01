import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listStockBalances, registerStockMovement } from '../services/stock'
import type { StockMovementInput } from '../types/inventory'

export function useStockBalances() {
  return useQuery({
    queryKey: ['stock'],
    queryFn: listStockBalances,
    // Mesmo motivo do useProducts: sem ORDER BY no backend, uma UPDATE de
    // saldo pode mudar a ordem física das linhas.
    select: (data) =>
      [...data].sort(
        (a, b) => a.productCode.localeCompare(b.productCode) || a.warehouseName.localeCompare(b.warehouseName),
      ),
  })
}

export function useRegisterStockMovement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: StockMovementInput) => registerStockMovement(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock'] }),
  })
}
