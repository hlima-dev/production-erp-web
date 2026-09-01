import { api } from './api'
import type { ProductionOrder, ProductionOrderInput, ProductionOrderStatus } from '../types/production'

export async function listProductionOrders(status?: ProductionOrderStatus): Promise<ProductionOrder[]> {
  const response = await api.get<ProductionOrder[]>('/production-orders', { params: status ? { status } : undefined })
  return response.data
}

export async function getProductionOrder(id: string): Promise<ProductionOrder> {
  const response = await api.get<ProductionOrder>(`/production-orders/${id}`)
  return response.data
}

export async function createProductionOrder(input: ProductionOrderInput): Promise<ProductionOrder> {
  const response = await api.post<ProductionOrder>('/production-orders', input)
  return response.data
}

export async function startProductionOrder(id: string): Promise<ProductionOrder> {
  const response = await api.post<ProductionOrder>(`/production-orders/${id}/start`)
  return response.data
}

export async function completeProductionOrder(id: string, producedQuantity?: number): Promise<ProductionOrder> {
  const response = await api.post<ProductionOrder>(
    `/production-orders/${id}/complete`,
    producedQuantity != null ? { producedQuantity } : undefined,
  )
  return response.data
}

export async function cancelProductionOrder(id: string): Promise<ProductionOrder> {
  const response = await api.post<ProductionOrder>(`/production-orders/${id}/cancel`)
  return response.data
}
