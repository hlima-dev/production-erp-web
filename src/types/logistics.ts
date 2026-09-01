export type DeliveryManifestStatus = 'PLANEJADO' | 'EM_ROTA' | 'CONCLUIDO'

export interface Vehicle {
  id: string
  plate: string
  model: string
  capacityKg: number | null
  active: boolean
}

export interface VehicleInput {
  plate: string
  model: string
  capacityKg?: number | null
}

export interface Driver {
  id: string
  name: string
  document: string
  license: string
  phone: string | null
  active: boolean
}

export interface DriverInput {
  name: string
  document: string
  license: string
  phone?: string
}

export interface ManifestOrder {
  orderId: string
  orderNumber: number
  customerName: string
  totalAmount: number
}

export interface DeliveryManifest {
  id: string
  manifestNumber: number
  vehicleId: string
  vehiclePlate: string
  driverId: string
  driverName: string
  status: DeliveryManifestStatus
  orders: ManifestOrder[]
  departedAt: string | null
  completedAt: string | null
  notes: string | null
  createdAt: string
}

export interface DeliveryManifestInput {
  vehicleId: string
  driverId: string
  orderIds: string[]
  notes?: string
}

export const DELIVERY_MANIFEST_STATUS_LABELS: Record<DeliveryManifestStatus, string> = {
  PLANEJADO: 'Planejado',
  EM_ROTA: 'Em rota',
  CONCLUIDO: 'Concluído',
}

export const DELIVERY_MANIFEST_STATUS_TONES: Record<DeliveryManifestStatus, 'neutral' | 'blue' | 'green' | 'red' | 'amber'> = {
  PLANEJADO: 'neutral',
  EM_ROTA: 'amber',
  CONCLUIDO: 'green',
}
