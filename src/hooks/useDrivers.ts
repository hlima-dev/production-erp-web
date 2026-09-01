import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDriver, deactivateDriver, listDrivers } from '../services/drivers'
import type { DriverInput } from '../types/logistics'

export function useDrivers(includeInactive = false) {
  return useQuery({
    queryKey: ['drivers', includeInactive],
    queryFn: () => listDrivers(includeInactive),
    select: (data) => [...data].sort((a, b) => a.name.localeCompare(b.name)),
  })
}

export function useCreateDriver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: DriverInput) => createDriver(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  })
}

export function useDeactivateDriver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deactivateDriver(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  })
}
