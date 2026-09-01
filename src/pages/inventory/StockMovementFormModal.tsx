import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../../components/Modal'
import { useRegisterStockMovement } from '../../hooks/useStock'
import { useProducts } from '../../hooks/useProducts'
import { useWarehouses } from '../../hooks/useWarehouses'
import { getErrorMessage, getFieldErrors } from '../../services/api'

const schema = z.object({
  productId: z.string().min(1, 'Selecione um produto'),
  warehouseId: z.string().min(1, 'Selecione um almoxarifado'),
  type: z.enum(['ENTRADA', 'SAIDA'], { message: 'Tipo é obrigatório' }),
  quantity: z.coerce.number().positive('Quantidade deve ser maior que zero'),
})

// Generics triplo por causa do z.coerce.number() em quantity — ver
// comentário equivalente em ProductFormModal.tsx.
type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

export function StockMovementFormModal({ onClose }: { onClose: () => void }) {
  const { data: products } = useProducts({ includeInactive: false })
  const { data: warehouses } = useWarehouses()
  const registerMovement = useRegisterStockMovement()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema), defaultValues: { type: 'ENTRADA' } })

  async function onSubmit(values: FormValues) {
    try {
      await registerMovement.mutateAsync(values)
      onClose()
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
    <Modal title="Novo movimento de estoque" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Produto</label>
          <select className="input" {...register('productId')}>
            <option value="">Selecione um produto</option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.code} — {product.name}
              </option>
            ))}
          </select>
          {errors.productId && <p className="mt-1 text-xs text-red-600">{errors.productId.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Almoxarifado</label>
          <select className="input" {...register('warehouseId')}>
            <option value="">Selecione um almoxarifado</option>
            {warehouses?.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.code} — {warehouse.name}
              </option>
            ))}
          </select>
          {errors.warehouseId && <p className="mt-1 text-xs text-red-600">{errors.warehouseId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tipo</label>
            <select className="input" {...register('type')}>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Quantidade</label>
            <input type="number" step="0.000001" className="input" {...register('quantity')} />
            {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity.message}</p>}
          </div>
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
            {isSubmitting ? 'Salvando...' : 'Lançar movimento'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
