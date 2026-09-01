import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useBillOfMaterial, useProduct, useProducts, useSaveBillOfMaterial } from '../../hooks/useProducts'
import { StatusBadge } from '../../components/StatusBadge'
import { getErrorMessage } from '../../services/api'
import { PRODUCT_TYPE_LABELS, UNIT_LABELS } from '../../types/catalog'

const itemSchema = z.object({
  ingredientId: z.string().min(1, 'Selecione um insumo'),
  quantityPerUnit: z.coerce.number().positive('Quantidade deve ser maior que zero'),
})

const schema = z.object({
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Adicione ao menos um insumo'),
})

// Generics triplo por causa do z.coerce.number() em quantityPerUnit — ver
// comentário equivalente em ProductFormModal.tsx.
type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading } = useProduct(id)
  const isFinishedGood = product?.type === 'PRODUTO_ACABADO'

  if (isLoading) return <p className="text-slate-500">Carregando...</p>
  if (!product) return <p className="text-slate-500">Produto não encontrado.</p>

  return (
    <div>
      <Link to="/produtos" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} />
        Voltar pra produtos
      </Link>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {product.name} <span className="font-normal text-slate-400">({product.code})</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {PRODUCT_TYPE_LABELS[product.type]} · {UNIT_LABELS[product.unit]}
              {product.category && ` · ${product.category}`}
              {product.price != null && ` · R$ ${product.price.toFixed(2)}`}
            </p>
          </div>
          <StatusBadge label={product.active ? 'Ativo' : 'Inativo'} tone={product.active ? 'green' : 'neutral'} />
        </div>
      </div>

      {isFinishedGood ? (
        <BillOfMaterialEditor productId={product.id} />
      ) : (
        <p className="text-sm text-slate-500">
          Ficha técnica só se aplica a produtos acabados — este é uma matéria-prima.
        </p>
      )}
    </div>
  )
}

function BillOfMaterialEditor({ productId }: { productId: string }) {
  const { data: bom, isLoading } = useBillOfMaterial(productId)
  const { data: ingredients } = useProducts({ type: 'MATERIA_PRIMA' })
  const saveBom = useSaveBillOfMaterial(productId)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { notes: '', items: [{ ingredientId: '', quantityPerUnit: 1 }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  // Repopula o form quando a ficha técnica carrega (ou quando ainda não existe).
  useEffect(() => {
    if (isLoading) return
    reset({
      notes: bom?.notes ?? '',
      items: bom && bom.items.length > 0
        ? bom.items.map((item) => ({ ingredientId: item.ingredientId, quantityPerUnit: item.quantityPerUnit }))
        : [{ ingredientId: '', quantityPerUnit: 1 }],
    })
  }, [bom, isLoading, reset])

  async function onSubmit(values: FormValues) {
    try {
      await saveBom.mutateAsync({
        notes: values.notes || undefined,
        items: values.items,
      })
    } catch (error) {
      setError('root', { message: getErrorMessage(error) })
    }
  }

  if (isLoading) return <p className="text-slate-500">Carregando ficha técnica...</p>

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-900">Ficha técnica</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Observações</label>
          <input className="input" {...register('notes')} placeholder="Ex: Receita padrão" />
        </div>

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <div className="flex-1">
                <select className="input" {...register(`items.${index}.ingredientId`)}>
                  <option value="">Selecione o insumo</option>
                  {ingredients?.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.code} — {ingredient.name}
                    </option>
                  ))}
                </select>
                {errors.items?.[index]?.ingredientId && (
                  <p className="mt-1 text-xs text-red-600">{errors.items[index]?.ingredientId?.message}</p>
                )}
              </div>
              <div className="w-40">
                <input
                  type="number"
                  step="0.000001"
                  className="input"
                  placeholder="Qtd. por unidade"
                  {...register(`items.${index}.quantityPerUnit`)}
                />
                {errors.items?.[index]?.quantityPerUnit && (
                  <p className="mt-1 text-xs text-red-600">{errors.items[index]?.quantityPerUnit?.message}</p>
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

        {errors.items?.root && <p className="text-xs text-red-600">{errors.items.root.message}</p>}

        <button
          type="button"
          onClick={() => append({ ingredientId: '', quantityPerUnit: 1 })}
          className="flex w-fit items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
        >
          <Plus size={16} />
          Adicionar insumo
        </button>

        {errors.root && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.root.message}</p>}

        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar ficha técnica'}
          </button>
        </div>
      </form>
    </div>
  )
}
