import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createVehicle, deactivateVehicle, listVehicles } from '../services/vehicles'
import type { VehicleInput } from '../types/logistics'

export function useVehicles(includeInactive = false) {
  return useQuery({
    queryKey: ['vehicles', includeInactive],
    queryFn: () => listVehicles(includeInactive),
    select: (data) => [...data].sort((a, b) => a.plate.localeCompare(b.plate)),
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: VehicleInput) => createVehicle(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}

export function useDeactivateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deactivateVehicle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}
