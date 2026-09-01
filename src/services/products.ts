import axios from 'axios'
import { api } from './api'
import type { BillOfMaterial, BillOfMaterialInput, Product, ProductInput, ProductType } from '../types/catalog'

export async function listProducts(params?: { type?: ProductType; includeInactive?: boolean }): Promise<Product[]> {
  const response = await api.get<Product[]>('/products', { params })
  return response.data
}

export async function getProduct(id: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`)
  return response.data
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const response = await api.post<Product>('/products', input)
  return response.data
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const response = await api.put<Product>(`/products/${id}`, input)
  return response.data
}

export async function deactivateProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`)
}

export async function getBillOfMaterial(productId: string): Promise<BillOfMaterial | null> {
  try {
    const response = await api.get<BillOfMaterial>(`/products/${productId}/bom`)
    return response.data
  } catch (error) {
    // 404 = produto ainda não tem ficha técnica cadastrada — estado
    // normal, não um erro a propagar.
    if (axios.isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export async function saveBillOfMaterial(productId: string, input: BillOfMaterialInput): Promise<BillOfMaterial> {
  const response = await api.put<BillOfMaterial>(`/products/${productId}/bom`, input)
  return response.data
}
