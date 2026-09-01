import { api } from './api'
import type { StockItem, StockMovement, StockMovementInput } from '../types/inventory'

export async function listStockBalances(): Promise<StockItem[]> {
  const response = await api.get<StockItem[]>('/inventory/stock')
  return response.data
}

export async function registerStockMovement(input: StockMovementInput): Promise<StockMovement> {
  const response = await api.post<StockMovement>('/inventory/movements', input)
  return response.data
}
