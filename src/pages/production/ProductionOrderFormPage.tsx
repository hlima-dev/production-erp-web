import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { useWarehouses } from '../../hooks/useWarehouses'
import { useCreateProductionOrder } from '../../hooks/useProductionOrders'
import { getErrorMessage, getFieldErrors } from '../../services/api'
import { PRODUCT_TYPE_LABELS } from '../../types/catalog'

const schema = z.object({
  productId: z.string().min(1, 'Selecione o produto'),
  warehouseId: z.string().min(1, 'Selecione o almoxarifado'),
  plannedQuantity: z.coerce.number().positive('Quantidade deve ser maior que zero'),
  notes: z.string().optional(),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

export function ProductionOrderFormPage() {
  const navigate = useNavigate()
  // Produto acabado ou semi-acabado podem virar ordem de produção — só
  // matéria-prima não, mesma regra do backend (BOM em múltiplos níveis: um
  // semi-acabado também é "produzido" a partir de uma ficha técnica própria,
  // e depois vira insumo de outro produto).
  const { data: allProducts } = useProducts({ includeInactive: false })
  const products = allProducts?.filter((p) => p.type !== 'MATERIA_PRIMA')
  const { data: warehouses } = useWarehouses()
  const createOrder = useCreateProductionOrder()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      const saved = await createOrder.mutateAsync({
        productId: values.productId,
        warehouseId: values.warehouseId,
        plannedQuantity: values.plannedQuantity,
        notes: values.notes || undefined,
      })
      navigate(`/producao/${saved.id}`)
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
    <div>
      <Link to="/producao" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Nova ordem de produção</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Produto (semi-acabado ou acabado)</label>
          <select className="input" {...register('productId')}>
            <option value="">Selecione o produto</option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.code} — {product.name} ({PRODUCT_TYPE_LABELS[product.type]})
              </option>
            ))}
          </select>
          {errors.productId && <p className="mt-1 text-xs text-red-600">{errors.productId.message}</p>}
          {products?.length === 0 && (
            <p className="mt-1 text-xs text-slate-400">Nenhum produto semi-acabado ou acabado ativo cadastrado ainda.</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Almoxarifado</label>
          <select className="input" {...register('warehouseId')}>
            <option value="">Selecione o almoxarifado</option>
            {warehouses?.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.code} — {warehouse.name}
              </option>
            ))}
          </select>
          {errors.warehouseId && <p className="mt-1 text-xs text-red-600">{errors.warehouseId.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Quantidade planejada</label>
          <input type="number" step="0.000001" className="input" {...register('plannedQuantity')} />
          {errors.plannedQuantity && <p className="mt-1 text-xs text-red-600">{errors.plannedQuantity.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Observações <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input className="input" {...register('notes')} />
        </div>

        {errors.root && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.root.message}</p>}

        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Criando...' : 'Criar ordem'}
          </button>
        </div>
      </form>
    </div>
  )
}
