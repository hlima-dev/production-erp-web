export interface Warehouse {
  id: string
  code: string
  name: string
  active: boolean
}

export interface WarehouseInput {
  code: string
  name: string
}

export interface StockItem {
  productId: string
  productCode: string
  productName: string
  warehouseId: string
  warehouseName: string
  quantity: number
}

export type MovementType = 'ENTRADA' | 'SAIDA' | 'RETIRADA_PRODUCAO'

// RETIRADA_PRODUCAO é gerada internamente pelo módulo de produção — o
// lançamento manual só aceita estes dois (mesma regra do backend, ver
// ManualMovementType.java).
export type ManualMovementType = 'ENTRADA' | 'SAIDA'

export interface StockMovement {
  id: string
  productId: string
  productName: string
  warehouseId: string
  warehouseName: string
  type: MovementType
  quantity: number
  referenceType: string | null
  referenceId: string | null
  createdAt: string
}

export interface StockMovementInput {
  productId: string
  warehouseId: string
  type: ManualMovementType
  quantity: number
}

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  RETIRADA_PRODUCAO: 'Retirada (produção)',
}
