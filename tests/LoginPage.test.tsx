import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '../src/pages/Login/LoginPage'

const loginMock = vi.hoisted(() => vi.fn())
vi.mock('../src/services/auth', () => ({ login: loginMock }))

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('renderiza os campos de e-mail e senha', () => {
    renderLoginPage()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })

  it('mostra erros de validação ao submeter vazio, sem chamar login', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('E-mail é obrigatório')).toBeInTheDocument()
    expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('chama login com e-mail e senha ao submeter um form válido', async () => {
    loginMock.mockResolvedValueOnce({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: '1', name: 'Admin', email: 'admin@erp.com.br', role: 'ADMIN' },
    })
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'admin@erp.com.br')
    await user.type(screen.getByLabelText('Senha'), 'Admin@123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith('admin@erp.com.br', 'Admin@123'))
  })
})
