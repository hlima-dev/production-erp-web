import { api } from './api'
import type { Driver, DriverInput } from '../types/logistics'

export async function listDrivers(includeInactive = false): Promise<Driver[]> {
  const response = await api.get<Driver[]>('/drivers', { params: { includeInactive } })
  return response.data
}

export async function createDriver(input: DriverInput): Promise<Driver> {
  const response = await api.post<Driver>('/drivers', input)
  return response.data
}

export async function deactivateDriver(id: string): Promise<void> {
  await api.delete(`/drivers/${id}`)
}
