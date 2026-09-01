export type ProductType = 'MATERIA_PRIMA' | 'SEMI_ACABADO' | 'PRODUTO_ACABADO'

export type UnitOfMeasure = 'UN' | 'KG' | 'G' | 'L' | 'ML' | 'CX'

export interface Product {
  id: string
  code: string
  name: string
  unit: UnitOfMeasure
  type: ProductType
  category: string | null
  price: number | null
  active: boolean
}

export interface ProductInput {
  code: string
  name: string
  unit: UnitOfMeasure
  type: ProductType
  category?: string
  price?: number | null
}

export interface BillOfMaterialItem {
  ingredientId: string
  ingredientCode: string
  ingredientName: string
  quantityPerUnit: number
}

export interface BillOfMaterial {
  id: string
  productId: string
  productName: string
  notes: string | null
  items: BillOfMaterialItem[]
}

export interface BillOfMaterialItemInput {
  ingredientId: string
  quantityPerUnit: number
}

export interface BillOfMaterialInput {
  notes?: string
  items: BillOfMaterialItemInput[]
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  MATERIA_PRIMA: 'Matéria-prima',
  SEMI_ACABADO: 'Semi-acabado',
  PRODUTO_ACABADO: 'Produto acabado',
}

export const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  UN: 'Unidade',
  KG: 'Quilograma',
  G: 'Grama',
  L: 'Litro',
  ML: 'Mililitro',
  CX: 'Caixa',
}
