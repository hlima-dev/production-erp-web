import { api } from './api'
import type { Warehouse, WarehouseInput } from '../types/inventory'

export async function listWarehouses(): Promise<Warehouse[]> {
  const response = await api.get<Warehouse[]>('/warehouses')
  return response.data
}

export async function createWarehouse(input: WarehouseInput): Promise<Warehouse> {
  const response = await api.post<Warehouse>('/warehouses', input)
  return response.data
}
