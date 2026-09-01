export type ProductionOrderStatus = 'ABERTA' | 'EM_PRODUCAO' | 'CONCLUIDA' | 'CANCELADA'

export interface ProductionOrder {
  id: string
  orderNumber: number
  productId: string
  productName: string
  warehouseId: string
  warehouseName: string
  plannedQuantity: number
  producedQuantity: number | null
  status: ProductionOrderStatus
  startedAt: string | null
  completedAt: string | null
  notes: string | null
  createdAt: string
}

export interface ProductionOrderInput {
  productId: string
  warehouseId: string
  plannedQuantity: number
  notes?: string
}

export const PRODUCTION_ORDER_STATUS_LABELS: Record<ProductionOrderStatus, string> = {
  ABERTA: 'Aberta',
  EM_PRODUCAO: 'Em produção',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
}

export const PRODUCTION_ORDER_STATUS_TONES: Record<ProductionOrderStatus, 'neutral' | 'blue' | 'green' | 'red' | 'amber'> = {
  ABERTA: 'neutral',
  EM_PRODUCAO: 'amber',
  CONCLUIDA: 'green',
  CANCELADA: 'red',
}
