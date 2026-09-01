import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../../components/Modal'
import { useCreateProduct, useUpdateProduct } from '../../hooks/useProducts'
import { getErrorMessage, getFieldErrors } from '../../services/api'
import { PRODUCT_TYPE_LABELS, UNIT_LABELS } from '../../types/catalog'
import type { Product } from '../../types/catalog'

const schema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  unit: z.enum(['UN', 'KG', 'G', 'L', 'ML', 'CX'], { message: 'Unidade é obrigatória' }),
  type: z.enum(['MATERIA_PRIMA', 'SEMI_ACABADO', 'PRODUTO_ACABADO'], { message: 'Tipo é obrigatório' }),
  category: z.string().optional(),
  // z.literal('') PRECISA vir antes de z.coerce.number(): union tenta as
  // opções em ordem e para na primeira que passar, e z.coerce.number()
  // coage string vazia pra 0 (Number('') === 0) — se viesse primeiro, um
  // campo de preço vazio nunca cairia no branch "sem preço".
  price: z.union([z.literal(''), z.coerce.number().min(0, 'Preço não pode ser negativo')]).optional(),
})

// Generics triplo por causa do z.coerce.number(): o tipo "de entrada" do
// campo (antes da coerção, o que register() aceita) difere do tipo "de
// saída" (depois da coerção, o que chega no onSubmit) — ver
// https://github.com/react-hook-form/resolvers#zod
type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

interface ProductFormModalProps {
  product?: Product
  onClose: () => void
}

export function ProductFormModal({ product, onClose }: ProductFormModalProps) {
  const isEditing = !!product
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(product?.id ?? '')
  const mutation = isEditing ? updateProduct : createProduct

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          code: product.code,
          name: product.name,
          unit: product.unit,
          type: product.type,
          category: product.category ?? '',
          price: product.price ?? '',
        }
      : { unit: 'UN', type: 'MATERIA_PRIMA' },
  })

  async function onSubmit(values: FormValues) {
    try {
      await mutation.mutateAsync({
        code: values.code,
        name: values.name,
        unit: values.unit,
        type: values.type,
        category: values.category || undefined,
        price: values.price === '' || values.price === undefined ? null : Number(values.price),
      })
      onClose()
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof FormValues, { message })
        })
      } else {
        setError('root', { message: getErrorMessage(error) })
      }
    }
  }

  return (
    <Modal title={isEditing ? 'Editar produto' : 'Novo produto'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Código</label>
            <input className="input" {...register('code')} />
            {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Unidade</label>
            <select className="input" {...register('unit')}>
              {Object.entries(UNIT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
          <input className="input" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tipo</label>
            <select className="input" {...register('type')}>
              {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Categoria</label>
            <input className="input" {...register('category')} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Preço <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input type="number" step="0.01" className="input" {...register('price')} />
          {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
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
