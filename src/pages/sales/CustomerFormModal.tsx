import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../../components/Modal'
import { useCreateCustomer, useUpdateCustomer } from '../../hooks/useCustomers'
import { getErrorMessage, getFieldErrors } from '../../services/api'
import type { Customer } from '../../types/sales'

const schema = z.object({
  document: z.string().min(1, 'Documento (CPF/CNPJ) é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.union([z.literal(''), z.string().email('E-mail inválido')]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CustomerFormModalProps {
  customer?: Customer
  onClose: () => void
}

export function CustomerFormModal({ customer, onClose }: CustomerFormModalProps) {
  const isEditing = !!customer
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer(customer?.id ?? '')
  const mutation = isEditing ? updateCustomer : createCustomer

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: customer
      ? {
          document: customer.document,
          name: customer.name,
          email: customer.email ?? '',
          phone: customer.phone ?? '',
          address: customer.address ?? '',
        }
      : undefined,
  })

  async function onSubmit(values: FormValues) {
    try {
      await mutation.mutateAsync({
        document: values.document,
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
      })
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
    <Modal title={isEditing ? 'Editar cliente' : 'Novo cliente'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Documento (CPF/CNPJ)</label>
            <input className="input" {...register('document')} />
            {errors.document && <p className="mt-1 text-xs text-red-600">{errors.document.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Telefone</label>
            <input className="input" {...register('phone')} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
          <input className="input" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
          <input className="input" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Endereço</label>
          <input className="input" {...register('address')} />
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
