import { api } from './api'
import type { Order, OrderInput, OrderStatus } from '../types/sales'

export async function listOrders(status?: OrderStatus): Promise<Order[]> {
  const response = await api.get<Order[]>('/orders', { params: status ? { status } : undefined })
  return response.data
}

export async function getOrder(id: string): Promise<Order> {
  const response = await api.get<Order>(`/orders/${id}`)
  return response.data
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const response = await api.post<Order>('/orders', input)
  return response.data
}

export async function updateOrder(id: string, input: OrderInput): Promise<Order> {
  const response = await api.put<Order>(`/orders/${id}`, input)
  return response.data
}

export async function confirmOrder(id: string): Promise<Order> {
  const response = await api.post<Order>(`/orders/${id}/confirm`)
  return response.data
}

export async function startOrderSeparation(id: string): Promise<Order> {
  const response = await api.post<Order>(`/orders/${id}/separation`)
  return response.data
}

export async function deliverOrder(id: string): Promise<Order> {
  const response = await api.post<Order>(`/orders/${id}/deliver`)
  return response.data
}

export async function cancelOrder(id: string): Promise<Order> {
  const response = await api.post<Order>(`/orders/${id}/cancel`)
  return response.data
}
