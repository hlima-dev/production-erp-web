import { api } from './api'
import type { Customer, CustomerInput } from '../types/sales'

export async function listCustomers(includeInactive = false): Promise<Customer[]> {
  const response = await api.get<Customer[]>('/customers', { params: { includeInactive } })
  return response.data
}

export async function getCustomer(id: string): Promise<Customer> {
  const response = await api.get<Customer>(`/customers/${id}`)
  return response.data
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const response = await api.post<Customer>('/customers', input)
  return response.data
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
  const response = await api.put<Customer>(`/customers/${id}`, input)
  return response.data
}

export async function deactivateCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`)
}
