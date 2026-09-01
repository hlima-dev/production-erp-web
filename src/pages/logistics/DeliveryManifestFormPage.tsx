import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { useVehicles } from '../../hooks/useVehicles'
import { useDrivers } from '../../hooks/useDrivers'
import { useOrders } from '../../hooks/useOrders'
import { useCreateDeliveryManifest } from '../../hooks/useDeliveryManifests'
import { getErrorMessage, getFieldErrors } from '../../services/api'

const schema = z.object({
  vehicleId: z.string().min(1, 'Selecione o veículo'),
  driverId: z.string().min(1, 'Selecione o motorista'),
  orderIds: z.array(z.string()).min(1, 'Selecione ao menos um pedido'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function DeliveryManifestFormPage() {
  const navigate = useNavigate()
  const { data: vehicles } = useVehicles()
  const { data: drivers } = useDrivers()
  // Só pedidos faturados podem entrar num romaneio — mesma regra do backend.
  const { data: faturableOrders } = useOrders('FATURADO')
  const createManifest = useCreateDeliveryManifest()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { orderIds: [] } })

  async function onSubmit(values: FormValues) {
    try {
      const saved = await createManifest.mutateAsync({
        vehicleId: values.vehicleId,
        driverId: values.driverId,
        orderIds: values.orderIds,
        notes: values.notes || undefined,
      })
      navigate(`/romaneios/${saved.id}`)
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => setError(field as keyof FormValues, { message }))
      } else {
        setError('root', { message: getErrorMessage(error) })
      }
    }
  }

  return (
    <div>
      <Link to="/romaneios" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Novo romaneio</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Veículo</label>
            <select className="input" {...register('vehicleId')}>
              <option value="">Selecione o veículo</option>
              {vehicles?.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} — {vehicle.model}
                </option>
              ))}
            </select>
            {errors.vehicleId && <p className="mt-1 text-xs text-red-600">{errors.vehicleId.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Motorista</label>
            <select className="input" {...register('driverId')}>
              <option value="">Selecione o motorista</option>
              {drivers?.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
            {errors.driverId && <p className="mt-1 text-xs text-red-600">{errors.driverId.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Observações <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input className="input" {...register('notes')} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Pedidos faturados disponíveis pra expedição</h2>

          {faturableOrders?.length === 0 && (
            <p className="text-sm text-slate-400">Nenhum pedido faturado aguardando expedição no momento.</p>
          )}

          <div className="flex flex-col gap-2">
            {faturableOrders?.map((order) => (
              <label key={order.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                <input type="checkbox" value={order.id} {...register('orderIds')} />
                <span className="font-medium text-slate-900">#{order.orderNumber}</span>
                <span className="text-slate-600">{order.customerName}</span>
                <span className="ml-auto tabular-nums text-slate-500">R$ {order.totalAmount.toFixed(2)}</span>
              </label>
            ))}
          </div>
          {errors.orderIds && <p className="mt-2 text-xs text-red-600">{errors.orderIds.message}</p>}
        </div>

        {errors.root && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.root.message}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Criando...' : 'Criar romaneio'}
          </button>
        </div>
      </form>
    </div>
  )
}
