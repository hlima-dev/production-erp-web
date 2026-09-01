import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCustomer,
  deactivateCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from '../services/customers'
import type { CustomerInput } from '../types/sales'

export function useCustomers(includeInactive = false) {
  return useQuery({
    queryKey: ['customers', includeInactive],
    queryFn: () => listCustomers(includeInactive),
    select: (data) => [...data].sort((a, b) => a.name.localeCompare(b.name)),
  })
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['customers', 'detail', id],
    queryFn: () => getCustomer(id!),
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CustomerInput) => createCustomer(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CustomerInput) => updateCustomer(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })
}

export function useDeactivateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deactivateCustomer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })
}
