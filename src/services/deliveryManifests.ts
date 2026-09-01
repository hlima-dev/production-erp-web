import { api } from './api'
import type { DeliveryManifest, DeliveryManifestInput, DeliveryManifestStatus } from '../types/logistics'

export async function listDeliveryManifests(status?: DeliveryManifestStatus): Promise<DeliveryManifest[]> {
  const response = await api.get<DeliveryManifest[]>('/delivery-manifests', { params: status ? { status } : undefined })
  return response.data
}

export async function getDeliveryManifest(id: string): Promise<DeliveryManifest> {
  const response = await api.get<DeliveryManifest>(`/delivery-manifests/${id}`)
  return response.data
}

export async function createDeliveryManifest(input: DeliveryManifestInput): Promise<DeliveryManifest> {
  const response = await api.post<DeliveryManifest>('/delivery-manifests', input)
  return response.data
}

export async function startDeliveryManifest(id: string): Promise<DeliveryManifest> {
  const response = await api.post<DeliveryManifest>(`/delivery-manifests/${id}/start`)
  return response.data
}

export async function completeDeliveryManifest(id: string): Promise<DeliveryManifest> {
  const response = await api.post<DeliveryManifest>(`/delivery-manifests/${id}/complete`)
  return response.data
}
