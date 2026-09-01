import { api } from './api'
import type { Vehicle, VehicleInput } from '../types/logistics'

export async function listVehicles(includeInactive = false): Promise<Vehicle[]> {
  const response = await api.get<Vehicle[]>('/vehicles', { params: { includeInactive } })
  return response.data
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const response = await api.post<Vehicle>('/vehicles', input)
  return response.data
}

export async function deactivateVehicle(id: string): Promise<void> {
  await api.delete(`/vehicles/${id}`)
}
