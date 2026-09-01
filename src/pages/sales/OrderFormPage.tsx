import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useCustomers } from '../../hooks/useCustomers'
import { useProducts } from '../../hooks/useProducts'
import { useCreateOrder, useOrder, useUpdateOrder } from '../../hooks/useOrders'
import { getErrorMessage, getFieldErrors } from '../../services/api'

const itemSchema = z.object({
  productId: z.string().min(1, 'Selecione um produto'),
  quantity: z.coerce.number().positive('Quantidade deve ser maior que zero'),
  unitPrice: z.union([z.literal(''), z.coerce.number().min(0, 'Preço não pode ser negativo')]).optional(),
})

const schema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  items: z.array(itemSchema).min(1, 'Adicione ao menos um item'),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

export function OrderFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()

  const { data: order, isLoading: isLoadingOrder } = useOrder(id)
  const { data: customers } = useCustomers(false)
  const { data: products } = useProducts({ includeInactive: false })
  const createOrder = useCreateOrder()
  const updateOrder = useUpdateOrder(id ?? '')
  const mutation = isEditing ? updateOrder : createOrder

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { items: [{ productId: '', quantity: 1, unitPrice: '' }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  // watch() do react-hook-form não é memoizável pelo React Compiler, mas
  // este projeto não usa o compiler — só o preview de total depende disso.
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedItems = watch('items')

  useEffect(() => {
    if (!order) return
    reset({
      customerId: order.customerId,
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    })
  }, [order, reset])

  function handleProductChange(index: number, productId: string) {
    const product = products?.find((p) => p.id === productId)
    if (product?.price != null) {
      setValue(`items.${index}.unitPrice`, product.price)
    }
  }

  const previewTotal = (watchedItems ?? []).reduce((sum, item) => {
    const product = products?.find((p) => p.id === item.productId)
    const price = item.unitPrice !== '' && item.unitPrice != null ? Number(item.unitPrice) : (product?.price ?? 0)
    const qty = Number(item.quantity) || 0
    return sum + price * qty
  }, 0)

  async function onSubmit(values: FormValues) {
    try {
      const input = {
        customerId: values.customerId,
        items: values.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice === '' || item.unitPrice === undefined ? undefined : Number(item.unitPrice),
        })),
      }
      const saved = await mutation.mutateAsync(input)
      navigate(`/pedidos/${saved.id}`)
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => setError(field as keyof FormInput, { message }))
      } else {
        setError('root', { message: getErrorMessage(error) })
      }
    }
  }

  if (isEditing && isLoadingOrder) return <p className="text-slate-500">Carregando...</p>
  if (isEditing && order && order.status !== 'RASCUNHO') {
    return (
      <div>
        <Link to={`/pedidos/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft size={16} />
          Voltar pro pedido
        </Link>
        <p className="text-sm text-slate-500">Só é possível editar pedidos em rascunho.</p>
      </div>
    )
  }

  return (
    <div>
      <Link to={isEditing ? `/pedidos/${id}` : '/pedidos'} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-slate-900">{isEditing ? `Editar pedido #${order?.orderNumber}` : 'Novo pedido'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <label className="mb-1 block text-sm font-medium text-slate-700">Cliente</label>
          <select className="input" {...register('customerId')}>
            <option value="">Selecione um cliente</option>
            {customers?.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.document} — {customer.name}
              </option>
            ))}
          </select>
          {errors.customerId && <p className="mt-1 text-xs text-red-600">{errors.customerId.message}</p>}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Itens</h2>

          <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <div className="flex-[2]">
                  <select
                    className="input"
                    {...register(`items.${index}.productId`, {
                      onChange: (e) => handleProductChange(index, e.target.value),
                    })}
                  >
                    <option value="">Selecione o produto</option>
                    {products?.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.code} — {product.name}
                      </option>
                    ))}
                  </select>
                  {errors.items?.[index]?.productId && (
                    <p className="mt-1 text-xs text-red-600">{errors.items[index]?.productId?.message}</p>
                  )}
                </div>
                <div className="w-28">
                  <input type="number" step="0.000001" className="input" placeholder="Qtd." {...register(`items.${index}.quantity`)} />
                  {errors.items?.[index]?.quantity && (
                    <p className="mt-1 text-xs text-red-600">{errors.items[index]?.quantity?.message}</p>
                  )}
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    placeholder="Preço unit."
                    {...register(`items.${index}.unitPrice`)}
                  />
                  {errors.items?.[index]?.unitPrice && (
                    <p className="mt-1 text-xs text-red-600">{errors.items[index]?.unitPrice?.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="mt-1 text-slate-400 hover:text-red-600 disabled:opacity-30"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({ productId: '', quantity: 1, unitPrice: '' })}
            className="mt-4 flex w-fit items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
          >
            <Plus size={16} />
            Adicionar item
          </button>

          <div className="mt-4 flex justify-end border-t border-slate-100 pt-4 text-sm">
            <span className="text-slate-500">
              Total estimado: <span className="font-semibold text-slate-900">R$ {previewTotal.toFixed(2)}</span>
            </span>
          </div>
        </div>

        {errors.root && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.root.message}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar pedido'}
          </button>
        </div>
      </form>
    </div>
  )
}
