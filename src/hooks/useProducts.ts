import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  deactivateProduct,
  getBillOfMaterial,
  getProduct,
  listProducts,
  saveBillOfMaterial,
  updateProduct,
} from '../services/products'
import type { BillOfMaterialInput, ProductInput, ProductType } from '../types/catalog'

export function useProducts(filters?: { type?: ProductType; includeInactive?: boolean }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => listProducts(filters),
    // O backend não garante ordem estável em findAll() (sem ORDER BY) —
    // uma UPDATE pode reordenar as linhas fisicamente no Postgres. Ordena
    // aqui pra lista não "pular" sozinha depois de editar um produto.
    select: (data) => [...data].sort((a, b) => a.code.localeCompare(b.code)),
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) => updateProduct(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useDeactivateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deactivateProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useBillOfMaterial(productId: string | undefined) {
  return useQuery({
    queryKey: ['products', productId, 'bom'],
    queryFn: () => getBillOfMaterial(productId!),
    enabled: !!productId,
  })
}

export function useSaveBillOfMaterial(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BillOfMaterialInput) => saveBillOfMaterial(productId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', productId, 'bom'] }),
  })
}
