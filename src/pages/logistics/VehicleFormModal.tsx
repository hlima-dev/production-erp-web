import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../../components/Modal'
import { useCreateVehicle } from '../../hooks/useVehicles'
import { getErrorMessage, getFieldErrors } from '../../services/api'

const schema = z.object({
  plate: z.string().min(1, 'Placa é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  capacityKg: z.union([z.literal(''), z.coerce.number().min(0, 'Capacidade não pode ser negativa')]).optional(),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

export function VehicleFormModal({ onClose }: { onClose: () => void }) {
  const createVehicle = useCreateVehicle()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      await createVehicle.mutateAsync({
        plate: values.plate,
        model: values.model,
        capacityKg: values.capacityKg === '' || values.capacityKg === undefined ? undefined : Number(values.capacityKg),
      })
      onClose()
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => setError(field as keyof FormInput, { message }))
      } else {
        setError('root', { message: getErrorMessage(error) })
      }
    }
  }

  return (
    <Modal title="Novo veículo" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Placa</label>
          <input className="input" {...register('plate')} />
          {errors.plate && <p className="mt-1 text-xs text-red-600">{errors.plate.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Modelo</label>
          <input className="input" {...register('model')} />
          {errors.model && <p className="mt-1 text-xs text-red-600">{errors.model.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Capacidade (kg) <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input type="number" step="0.01" className="input" {...register('capacityKg')} />
          {errors.capacityKg && <p className="mt-1 text-xs text-red-600">{errors.capacityKg.message}</p>}
        </div>

        {errors.root && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.root.message}</p>}

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
