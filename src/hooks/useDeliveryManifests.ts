import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  completeDeliveryManifest,
  createDeliveryManifest,
  getDeliveryManifest,
  listDeliveryManifests,
  startDeliveryManifest,
} from '../services/deliveryManifests'
import type { DeliveryManifestInput, DeliveryManifestStatus } from '../types/logistics'

export function useDeliveryManifests(status?: DeliveryManifestStatus) {
  return useQuery({
    queryKey: ['delivery-manifests', status],
    queryFn: () => listDeliveryManifests(status),
    select: (data) => [...data].sort((a, b) => b.manifestNumber - a.manifestNumber),
  })
}

export function useDeliveryManifest(id: string | undefined) {
  return useQuery({
    queryKey: ['delivery-manifests', 'detail', id],
    queryFn: () => getDeliveryManifest(id!),
    enabled: !!id,
  })
}

function useInvalidateDeliveryManifests() {
  const queryClient = useQueryClient()
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['delivery-manifests'] })
    if (id) queryClient.invalidateQueries({ queryKey: ['delivery-manifests', 'detail', id] })
    // Criar/concluir romaneio muda o status do pedido (EXPEDIDO/ENTREGUE).
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }
}

export function useCreateDeliveryManifest() {
  const invalidate = useInvalidateDeliveryManifests()
  return useMutation({
    mutationFn: (input: DeliveryManifestInput) => createDeliveryManifest(input),
    onSuccess: () => invalidate(),
  })
}

export function useStartDeliveryManifest() {
  const invalidate = useInvalidateDeliveryManifests()
  return useMutation({
    mutationFn: (id: string) => startDeliveryManifest(id),
    onSuccess: (_, id) => invalidate(id),
  })
}

export function useCompleteDeliveryManifest() {
  const invalidate = useInvalidateDeliveryManifests()
  return useMutation({
    mutationFn: (id: string) => completeDeliveryManifest(id),
    onSuccess: (_, id) => invalidate(id),
  })
}
