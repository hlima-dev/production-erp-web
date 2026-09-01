export type OrderStatus =
  | 'RASCUNHO'
  | 'CONFIRMADO'
  | 'EM_SEPARACAO'
  | 'FATURADO'
  | 'EXPEDIDO'
  | 'ENTREGUE'
  | 'CANCELADO'

export interface Customer {
  id: string
  document: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  active: boolean
}

export interface CustomerInput {
  document: string
  name: string
  email?: string
  phone?: string
  address?: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface OrderItemInput {
  productId: string
  quantity: number
  unitPrice?: number | null
}

export interface Order {
  id: string
  orderNumber: number
  customerId: string
  customerName: string
  status: OrderStatus
  totalAmount: number
  items: OrderItem[]
  createdAt: string
}

export interface OrderInput {
  customerId: string
  items: OrderItemInput[]
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  RASCUNHO: 'Rascunho',
  CONFIRMADO: 'Confirmado',
  EM_SEPARACAO: 'Em separação',
  FATURADO: 'Faturado',
  EXPEDIDO: 'Expedido',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

export const ORDER_STATUS_TONES: Record<OrderStatus, 'neutral' | 'blue' | 'green' | 'red' | 'amber'> = {
  RASCUNHO: 'neutral',
  CONFIRMADO: 'blue',
  EM_SEPARACAO: 'amber',
  FATURADO: 'blue',
  EXPEDIDO: 'blue',
  ENTREGUE: 'green',
  CANCELADO: 'red',
}
