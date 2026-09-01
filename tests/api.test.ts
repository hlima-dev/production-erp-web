import { describe, expect, it } from 'vitest'
import axios from 'axios'
import { getErrorMessage, getFieldErrors } from '../src/services/api'

describe('getErrorMessage', () => {
  it('extrai a mensagem do ApiError do backend', () => {
    const error = new axios.AxiosError('Request failed', undefined, undefined, undefined, {
      status: 422,
      data: { message: 'Dados inválidos', status: 422 },
      statusText: 'Unprocessable Entity',
      headers: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: {} as any,
    })

    expect(getErrorMessage(error)).toBe('Dados inválidos')
  })

  it('devolve mensagem genérica pra erro sem resposta do axios', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('Ocorreu um erro inesperado.')
  })
})

describe('getFieldErrors', () => {
  it('extrai fieldErrors de uma resposta 422 de validação', () => {
    const error = new axios.AxiosError('Request failed', undefined, undefined, undefined, {
      status: 422,
      data: { message: 'Dados inválidos', fieldErrors: { email: 'E-mail é obrigatório' } },
      statusText: 'Unprocessable Entity',
      headers: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: {} as any,
    })

    expect(getFieldErrors(error)).toEqual({ email: 'E-mail é obrigatório' })
  })
})
